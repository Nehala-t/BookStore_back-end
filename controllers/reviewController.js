import Review from "../models/Review.js";
import Book from "../models/Book.js";
import Order from "../models/Order.js";
import HttpError from "../utils/httpError.js";

// Add Review
export const addReview = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    // Only users can add reviews
    if (req.user.role !== "user") {
      return next(
        new HttpError("Only users can add reviews", 403)
      );
    }

    const userId = req.user.user_id;
    const { bookId, rating, review } = req.body || {};

    // Validate bookId
    if (!bookId) {
      return next(new HttpError("Book ID is required", 400));
    }

    // Validate rating
    if (
      rating === undefined ||
      rating === null ||
      Number.isNaN(Number(rating))
    ) {
      return next(
        new HttpError("Valid rating is required", 400)
      );
    }

    const numericRating = Number(rating);

    if (numericRating < 1 || numericRating > 5) {
      return next(
        new HttpError("Rating must be between 1 and 5", 400)
      );
    }

    // Validate review
    if (!review || !review.trim()) {
      return next(
        new HttpError("Review is required", 400)
      );
    }

    // Find active book
    const book = await Book.findOne({
      _id: bookId,
      isDeleted: false,
      status: "available",
    });

    if (!book) {
      return next(new HttpError("Book not found", 404));
    }

    // Check whether user has already reviewed this book
    const existingReview = await Review.findOne({
      userId,
      bookId,
      isDeleted: false,
    });

    if (existingReview) {
      return next(
        new HttpError(
          "You have already reviewed this book",
          400
        )
      );
    }

    // Create review
    const newReview = await Review.create({
      userId,
      bookId,
      rating: numericRating,
      review: review.trim(),
      isDeleted: false,
    });

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: newReview,
    });
  } catch (error) {
    next(error);
  }
};


// Get Reviews for a Book
export const getBookReviews = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    const { bookId } = req.params;

    if (!bookId) {
      return next(new HttpError("Book ID is required", 400));
    }

    // Check book
    const book = await Book.findOne({
      _id: bookId,
      isDeleted: false,
    });

    if (!book) {
      return next(new HttpError("Book not found", 404));
    }

    const reviews = await Review.find({
      bookId,
      isDeleted: false,
    })
      .populate("userId", "firstName lastName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Book reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};


// Get Review by ID
export const getReviewById = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    const { id } = req.params;

    const review = await Review.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate("userId", "firstName lastName")
      .populate("bookId", "title image");

    if (!review) {
      return next(new HttpError("Review not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Review fetched successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};


// Update Review
export const updateReview = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    // Only users can update their reviews
    if (req.user.role !== "user") {
      return next(
        new HttpError("Only users can update reviews", 403)
      );
    }

    const userId = req.user.user_id;
    const { id } = req.params;
    const { rating, review } = req.body || {};

    // Find user's review
    const existingReview = await Review.findOne({
      _id: id,
      userId,
      isDeleted: false,
    });

    if (!existingReview) {
      return next(
        new HttpError("Review not found", 404)
      );
    }

    // Validate rating if provided
    if (rating !== undefined) {
      if (
        Number.isNaN(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5
      ) {
        return next(
          new HttpError(
            "Rating must be between 1 and 5",
            400
          )
        );
      }

      existingReview.rating = Number(rating);
    }

    // Validate review if provided
    if (review !== undefined) {
      if (!review.trim()) {
        return next(
          new HttpError("Review cannot be empty", 400)
        );
      }

      existingReview.review = review.trim();
    }

    await existingReview.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: existingReview,
    });
  } catch (error) {
    next(error);
  }
};


// Delete Review
export const deleteReview = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    const userId = req.user.user_id;
    const { id } = req.params;

    let review;

    // User can delete their own review
    if (req.user.role === "user") {
      review = await Review.findOne({
        _id: id,
        userId,
        isDeleted: false,
      });

      if (!review) {
        return next(
          new HttpError("Review not found", 404)
        );
      }
    }

    // Admin can delete any review
    else if (req.user.role === "admin") {
      review = await Review.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!review) {
        return next(
          new HttpError("Review not found", 404)
        );
      }
    }

    // Seller cannot delete reviews
    else {
      return next(
        new HttpError(
          "Sellers cannot delete reviews",
          403
        )
      );
    }

    // Soft delete
    review.isDeleted = true;

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};