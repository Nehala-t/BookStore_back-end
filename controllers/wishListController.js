import WishList from "../models/Wishlist.js";
import Book from "../models/Book.js";
import HttpError from "../utils/httpError.js";

// ==========================================
// ADD BOOK TO WISHLIST
// ==========================================

export const AddWishList = async (req, res, next) => {
  try {
    // ==========================================
    // CHECK AUTHENTICATION
    // ==========================================

    if (!req.user || !req.user.user_id) {
      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    // ==========================================
    // ONLY USER CAN USE WISHLIST
    // ==========================================

    if (req.user.role !== "user") {
      return next(
        new HttpError(
          "Only users can use wishlist",
          403
        )
      );
    }

    // ==========================================
    // GET BOOK ID
    // ==========================================

    const { bookId } = req.body;

    if (!bookId) {
      return next(
        new HttpError("Book ID is required", 400)
      );
    }

    // ==========================================
    // CHECK BOOK EXISTS
    // ==========================================

    const book = await Book.findById(bookId);

    if (!book) {
      return next(
        new HttpError("Book not found", 404)
      );
    }

    const userId = req.user.user_id;

    // ==========================================
    // FIND USER WISHLIST
    // ==========================================

    let wishlist = await WishList.findOne({
      userId,
    });

    // ==========================================
    // CREATE NEW WISHLIST
    // ==========================================

    if (!wishlist) {
      wishlist = new WishList({
        userId,
        books: [
          {
            bookId,
            isDeleted: false,
          },
        ],
      });

      await wishlist.save();

      return res.status(201).json({
        success: true,
        message: "Book added to wishlist successfully",
        action: "added",
        data: wishlist,
      });
    }

    // ==========================================
    // CHECK EXISTING BOOK
    // ==========================================

    const existingBook = wishlist.books.find(
      (item) =>
        item.bookId &&
        item.bookId.toString() === bookId.toString()
    );

    // ==========================================
    // BOOK ALREADY EXISTS
    // ==========================================

    if (existingBook) {

      // ========================================
      // SOFT DELETED → RESTORE
      // ========================================

      if (existingBook.isDeleted) {
        existingBook.isDeleted = false;

        await wishlist.save();

        return res.status(200).json({
          success: true,
          message: "Book added back to wishlist",
          action: "added",
          data: wishlist,
        });
      }

      // ========================================
      // ACTIVE → SOFT DELETE
      // ========================================

      existingBook.isDeleted = true;

      await wishlist.save();

      return res.status(200).json({
        success: true,
        message: "Book removed from wishlist",
        action: "removed",
        data: wishlist,
      });
    }

    // ==========================================
    // NEW BOOK → ADD
    // ==========================================

    wishlist.books.push({
      bookId,
      isDeleted: false,
    });

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Book added to wishlist successfully",
      action: "added",
      data: wishlist,
    });

  } catch (error) {
    console.error("Add wishlist error:", error);
    next(error);
  }
};

// ==========================================
// VIEW WISHLIST
// ==========================================

export const ViewWishList = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    // Only users can view wishlist
    if (req.user.role !== "user") {
      return next(
        new HttpError(
          "Only users can view wishlist",
          403
        )
      );
    }

    // Find wishlist and populate books
    const wishlist = await WishList.findOne({
      userId: req.user.user_id,
    }).populate("books.bookId");

    // ==========================================
    // NO WISHLIST
    // ==========================================

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: "Wishlist is empty",
        data: [],
      });
    }

    // ==========================================
    // ONLY ACTIVE BOOKS
    // ==========================================

    const activeBooks = wishlist.books.filter(
      (item) => !item.isDeleted
    );

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",

      data: [
        {
          ...wishlist.toObject(),

          books: activeBooks,
        },
      ],
    });
  } catch (error) {
    next(error);
  }
};


// ==========================================
// REMOVE BOOK FROM WISHLIST
// SOFT DELETE
// ==========================================

export const RemoveWishlist = async (
  req,
  res,
  next
) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    // Only users can remove wishlist items
    if (req.user.role !== "user") {
      return next(
        new HttpError(
          "Only users can remove wishlist items",
          403
        )
      );
    }

    const { bookId } = req.params;

    // Check book ID
    if (!bookId) {
      return next(
        new HttpError("Book ID is required", 400)
      );
    }

    // Find wishlist
    const wishlist = await WishList.findOne({
      userId: req.user.user_id,
    });

    if (!wishlist) {
      return next(
        new HttpError(
          "Wishlist not found",
          404
        )
      );
    }

    // Find book
    const book = wishlist.books.find(
      (item) =>
        item.bookId.toString() === bookId.toString()
    );

    if (!book) {
      return next(
        new HttpError(
          "Book not found in wishlist",
          404
        )
      );
    }

    // ==========================================
    // SOFT DELETE
    // ==========================================

    book.isDeleted = true;

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message:
        "Book removed from wishlist successfully",
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};


// ==========================================
// CLEAR WISHLIST
// SOFT DELETE ALL
// ==========================================

export const ClearWishlist = async (
  req,
  res,
  next
) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    // Only users can clear wishlist
    if (req.user.role !== "user") {
      return next(
        new HttpError(
          "Only users can clear wishlist",
          403
        )
      );
    }

    // Find wishlist
    const wishlist = await WishList.findOne({
      userId: req.user.user_id,
    });

    // No wishlist
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: "Wishlist is already empty",
        data: [],
      });
    }

    // ==========================================
    // SOFT DELETE ALL BOOKS
    // ==========================================

    wishlist.books.forEach((item) => {
      item.isDeleted = true;
    });

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};