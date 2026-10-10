import Book from "../models/Book.js";
import HttpError from "../utils/httpError.js";

// GET SELLER INVENTORY
// Seller can view their own active book stock
// GET SELLER INVENTORY
// Seller can view their own active book stock
export const getSellerInventory = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    // Only seller can view inventory
    if (req.user.role !== "seller") {
      return next(
        new HttpError(
          "Only sellers can view inventory",
          403
        )
      );
    }

    // Get search from query
    const { search = "" } = req.query;

    // Base filter
    const filter = {
      sellerId: req.user.user_id,
      isDeleted: false,
    };

    // Backend search
    if (search.trim()) {
      filter.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          author: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          category: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          isbn: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          publisher: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const books = await Book.find(filter)
      .select(
        "title description price discountPrice category author isbn publisher publicationDate pages language stock status images isDeleted"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Inventory fetched successfully",
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE BOOK STOCK
// Seller can update stock of their own active book
export const updateStock = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    // Only seller can update inventory
    if (req.user.role !== "seller") {
      return next(
        new HttpError("Only sellers can update inventory", 403)
      );
    }

    const { id } = req.params;
    const { stock } = req.body;

    // Check stock
    if (stock === undefined || stock === null) {
      return next(new HttpError("Stock is required", 400));
    }

    // Check valid number
    if (Number.isNaN(Number(stock))) {
      return next(
        new HttpError("Stock must be a valid number", 400)
      );
    }

    // Stock cannot be negative
    if (Number(stock) < 0) {
      return next(
        new HttpError("Stock cannot be negative", 400)
      );
    }

    // Find only seller's active book
    const book = await Book.findOne({
      _id: id,
      sellerId: req.user.user_id,
      isDeleted: false,
    });

    if (!book) {
      return next(
        new HttpError("Book not found or access denied", 404)
      );
    }

    book.stock = Number(stock);

    await book.save();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};


// INCREASE STOCK
export const increaseStock = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    // Only seller can manage inventory
    if (req.user.role !== "seller") {
      return next(
        new HttpError("Only sellers can manage inventory", 403)
      );
    }

    const { id } = req.params;
    const { quantity } = req.body;

    // Validate quantity
    if (
      quantity === undefined ||
      quantity === null ||
      Number.isNaN(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      return next(
        new HttpError("Quantity must be greater than 0", 400)
      );
    }

    // Find only seller's active book
    const book = await Book.findOne({
      _id: id,
      sellerId: req.user.user_id,
      isDeleted: false,
    });

    if (!book) {
      return next(
        new HttpError("Book not found or access denied", 404)
      );
    }

    book.stock += Number(quantity);

    await book.save();

    res.status(200).json({
      success: true,
      message: "Stock increased successfully",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};


// DECREASE STOCK
export const decreaseStock = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    // Only seller can manage inventory
    if (req.user.role !== "seller") {
      return next(
        new HttpError("Only sellers can manage inventory", 403)
      );
    }

    const { id } = req.params;
    const { quantity } = req.body;

    // Validate quantity
    if (
      quantity === undefined ||
      quantity === null ||
      Number.isNaN(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      return next(
        new HttpError("Quantity must be greater than 0", 400)
      );
    }

    // Find only seller's active book
    const book = await Book.findOne({
      _id: id,
      sellerId: req.user.user_id,
      isDeleted: false,
    });

    if (!book) {
      return next(
        new HttpError("Book not found or access denied", 404)
      );
    }

    // Check available stock
    if (book.stock < Number(quantity)) {
      return next(
        new HttpError("Insufficient stock", 400)
      );
    }

    book.stock -= Number(quantity);

    await book.save();

    res.status(200).json({
      success: true,
      message: "Stock decreased successfully",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};