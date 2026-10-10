import Book from "../models/Book.js";
import HttpError from "../utils/httpError.js";


// SELLER CONTROLLERS

export const getAllSellerBook = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    // Check seller role
    if (req.user.role !== "seller") {
      return next(
        new HttpError("Only sellers can view their books", 403)
      );
    }

    const sellerId = req.user.user_id;

    // Get seller's active books
    const books = await Book.find({
      sellerId: sellerId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    if (!books || books.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No books found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Seller books fetched successfully",
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

export const addBook = async (req, res, next) => {
  try {
    console.log("========== ADD BOOK ==========");
    console.log("USER:", req.user);
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    // Check authentication
    if (!req.user || !req.user.user_id) {
      console.log("ERROR: No authenticated user");

      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    // Check seller role
    if (req.user.role !== "seller") {
      console.log("ERROR: User is not a seller");

      return next(
        new HttpError("Only sellers can add books", 403)
      );
    }

    const sellerId = req.user.user_id;

    const {
      title,
      description,
      price,
      discountPrice,
      category,
      author,
      isbn,
      publisher,
      publicationDate,
      pages,
      language,
      stock,
    } = req.body;

    // Get uploaded images
    const images =
      req.files?.map((file) => file.path) || [];

    console.log("IMAGE PATHS:", images);

    if (images.length === 0) {
      return next(
        new HttpError(
          "At least one book image is required",
          400
        )
      );
    }

    const book = await Book.create({
      title,
      description,
      price,
      discountPrice,
      images,
      category,
      author,
      sellerId,
      isbn,
      publisher,
      publicationDate,
      pages,
      language,
      stock,
    });

    console.log("BOOK CREATED:", book._id);

    return res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: book,
    });

  } catch (error) {
    console.error("========== ADD BOOK ERROR ==========");
    console.error(error);
    console.error("====================================");

    // ==========================================
    // DUPLICATE KEY ERROR
    // ==========================================

    if (error.code === 11000) {
      if (error.keyPattern?.isbn) {
        return res.status(400).json({
          success: false,
          message: `ISBN ${error.keyValue?.isbn} already exists`,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Duplicate value already exists",
      });
    }

    // ==========================================
    // OTHER ERRORS
    // ==========================================

    return next(error);
  };
}

export const editBook = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      console.log("ERROR: No authenticated user");

      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    // Check seller role
    if (req.user.role !== "seller") {
      console.log("ERROR: User is not a seller");

      return next(
        new HttpError("Only sellers can edit books", 403)
      );
    }

    const sellerId = req.user.user_id;

    // Get book ID from URL
    const { id } = req.params;

    // Find the book
    const book = await Book.findById(id);

    if (!book) {
      return next(
        new HttpError("Book not found", 404)
      );
    }

    // Check book ownership
    if (book.sellerId.toString() !== sellerId.toString()) {
      return next(
        new HttpError(
          "You are not authorized to edit this book",
          403
        )
      );
    }

    const {
      title,
      description,
      price,
      discountPrice,
      category,
      author,
      isbn,
      publisher,
      publicationDate,
      pages,
      language,
      stock,
      status,
    } = req.body;

    // Update only the fields that were sent
    if (title !== undefined) {
      book.title = title;
    }

    if (description !== undefined) {
      book.description = description;
    }

    if (price !== undefined) {
      book.price = price;
    }

    if (discountPrice !== undefined) {
      book.discountPrice = discountPrice;
    }

    if (category !== undefined) {
      book.category = category;
    }

    if (author !== undefined) {
      book.author = author;
    }

    if (isbn !== undefined && isbn !== book.isbn) {
  const existingBook = await Book.findOne({
    isbn,
    _id: { $ne: id },
  });

  if (existingBook) {
    return next(
      new HttpError("ISBN already exists for another book", 400)
    );
  }

  book.isbn = isbn;
}

    if (publisher !== undefined) {
      book.publisher = publisher;
    }

    if (publicationDate !== undefined) {
      book.publicationDate = publicationDate;
    }

    if (pages !== undefined) {
      book.pages = pages;
    }

    if (language !== undefined) {
      book.language = language;
    }

    if (stock !== undefined) {
      book.stock = stock;
    }

    if (status !== undefined) {
      book.status = status;
    }

    // If new images are uploaded,
    // replace the old images
    if (req.files && req.files.length > 0) {
      const images = req.files.map((file) => file.path);

      book.images = images;
    }

    const updatedBook = await book.save();

    return res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteBook = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      console.log("ERROR: No authenticated user");

      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    // Check seller role
    if (req.user.role !== "seller") {
      console.log("ERROR: User is not a seller");

      return next(
        new HttpError("Only sellers can delete books", 403)
      );
    }

    const { id } = req.params;
    const sellerId = req.user.user_id;

    // Find the book belonging to this seller
    const book = await Book.findOne({
      _id: id,
      sellerId: sellerId,
      isDeleted: false,
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found or you are not authorized to delete this book",
      });
    }

    // Soft delete
    book.isDeleted = true;
    await book.save();

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


// COMMEN CONTROLLER

export const viewSingleBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    const book = await Book.findOne({
      _id: id,
      isDeleted: false,
    }).populate("sellerId", "firstName lastName email");

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book fetched successfully",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};


// USER CONTROLLERS

export const getAllBooks = async (req, res, next) => {
  try {
    // =========================
    // Authentication
    // =========================

    if (!req.user || !req.user.user_id) {
      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    // =========================
    // Role Check
    // =========================

    if (req.user.role !== "user") {
      return next(
        new HttpError("Only users can view books", 403)
      );
    }

    // =========================
    // Pagination
    // =========================

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.max(
      parseInt(req.query.limit) || 2,
      1
    );

    const skip = (page - 1) * limit;

    // =========================
    // Search
    // =========================

    const search =
      req.query.search?.trim() || "";

    // =========================
    // Category
    // =========================

    const category =
      req.query.category?.trim() || "";

    // =========================
    // Base Filter
    // =========================

    const filter = {
      status: "available",
      stock: { $gt: 0 },
      isDeleted: false,
    };

    // =========================
    // Search Title / Author / Category
    // =========================

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          author: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // =========================
    // Category Filter
    // =========================

    if (category && category !== "All") {
      filter.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    // =========================
    // Total Books
    // =========================

    const totalBooks =
      await Book.countDocuments(filter);

    // =========================
    // Get Books
    // =========================

    const books = await Book.find(filter)
      .populate(
        "sellerId",
        "firstName lastName"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // =========================
    // Pagination
    // =========================

    const totalPages =
      Math.ceil(totalBooks / limit);

    return res.status(200).json({
      success: true,

      message: "Books fetched successfully",

      data: books,

      pagination: {
        currentPage: page,
        totalPages,
        totalBooks,
        limit,

        hasNextPage:
          page < totalPages,

        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};


