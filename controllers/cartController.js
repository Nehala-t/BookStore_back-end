
import Cart from "../models/Cart.js";
import Book from "../models/Book.js";
import HttpError from "../utils/httpError.js";

// ADD BOOK TO CART
// Only users can add books to cart
export const addToCart = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    // Only users can use cart
    if (req.user.role !== "user") {
      return next(
        new HttpError("Only users can add books to cart", 403)
      );
    }

    const userId = req.user.user_id;
    const { bookId, quantity } = req.body || {};

    // Validate bookId
    if (!bookId) {
      return next(new HttpError("Book ID is required", 400));
    }

    // Validate quantity
    const requestedQuantity = Number(quantity) || 1;

    if (requestedQuantity <= 0) {
      return next(
        new HttpError("Quantity must be greater than 0", 400)
      );
    }

    // Find active approved book
    const book = await Book.findOne({
      _id: bookId,
      isDeleted: false,
      status: "available",
    });

    if (!book) {
      return next(new HttpError("Book not found", 404));
    }

    // Check stock
    if (book.stock <= 0) {
      return next(
        new HttpError("Book is out of stock", 400)
      );
    }

    // Check requested quantity against stock
    if (requestedQuantity > book.stock) {
      return next(
        new HttpError(
          `Only ${book.stock} copies are available`,
          400
        )
      );
    }

    // Find existing cart item
    const existingCartItem = await Cart.findOne({
      userId,
      bookId,
    });

    // If cart item already exists
    if (existingCartItem) {
      // If it was soft deleted, restore it
      if (existingCartItem.isDeleted) {
        existingCartItem.quantity = requestedQuantity;
        existingCartItem.isDeleted = false;

        await existingCartItem.save();

        return res.status(200).json({
          success: true,
          message: "Book added to cart successfully",
          data: existingCartItem,
        });
      }

      // If active, increase quantity
      const newQuantity =
        existingCartItem.quantity + requestedQuantity;

      if (newQuantity > book.stock) {
        return next(
          new HttpError(
            `Only ${book.stock} copies are available`,
            400
          )
        );
      }

      existingCartItem.quantity = newQuantity;

      await existingCartItem.save();

      return res.status(200).json({
        success: true,
        message: "Book quantity updated in cart",
        data: existingCartItem,
      });
    }

    // Create new cart item
    const cartItem = await Cart.create({
      userId,
      bookId,
      quantity: requestedQuantity,
      isDeleted: false,
    });

    return res.status(201).json({
      success: true,
      message: "Book added to cart successfully",
      data: cartItem,
    });
  } catch (error) {
    next(error);
  }
};


// GET USER CART
export const getCart = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    // Only users can view cart
    if (req.user.role !== "user") {
      return next(
        new HttpError("Only users can view cart", 403)
      );
    }

    const userId = req.user.user_id;

    const cart = await Cart.find({
  userId,
  isDeleted: false,
}).populate(
  "bookId",
  "title description price discountPrice images category author stock"
);

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};


// UPDATE CART QUANTITY
export const updateCartQuantity = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    // Only users can update cart
    if (req.user.role !== "user") {
      return next(
        new HttpError("Only users can update cart", 403)
      );
    }

    const userId = req.user.user_id;
    const { bookId } = req.params;
    const { quantity } = req.body || {};

    // Validate quantity
    if (
      quantity === undefined ||
      quantity === null ||
      Number.isNaN(Number(quantity))
    ) {
      return next(
        new HttpError("Valid quantity is required", 400)
      );
    }

    const newQuantity = Number(quantity);

    if (newQuantity <= 0) {
      return next(
        new HttpError("Quantity must be greater than 0", 400)
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

    // Check stock
    if (newQuantity > book.stock) {
      return next(
        new HttpError(
          `Only ${book.stock} copies are available`,
          400
        )
      );
    }

    // Find active cart item
    const cartItem = await Cart.findOne({
      userId,
      bookId,
      isDeleted: false,
    });

    if (!cartItem) {
      return next(
        new HttpError("Book is not in your cart", 404)
      );
    }

    // Update quantity
    cartItem.quantity = newQuantity;

    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      data: cartItem,
    });
  } catch (error) {
    next(error);
  }
};

// REMOVE BOOK FROM CART
export const removeFromCart = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    // Only users can remove books
    if (req.user.role !== "user") {
      return next(
        new HttpError("Only users can modify cart", 403)
      );
    }

    const userId = req.user.user_id;
    const { bookId } = req.params;

    // Find active cart item
    const cartItem = await Cart.findOne({
      userId,
      bookId,
      isDeleted: false,
    });

    if (!cartItem) {
      return next(
        new HttpError("Book is not in your cart", 404)
      );
    }

    // Soft delete
    cartItem.isDeleted = true;

    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: "Book removed from cart successfully",
      data: cartItem,
    });
  } catch (error) {
    next(error);
  }
};


// CLEAR CART
// CLEAR CART
export const clearCart = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    // Only users can clear cart
    if (req.user.role !== "user") {
      return next(
        new HttpError("Only users can clear cart", 403)
      );
    }

    const userId = req.user.user_id;

    // Soft delete all active cart items
    const result = await Cart.updateMany(
      {
        userId,
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message:
        result.modifiedCount > 0
          ? "Cart cleared successfully"
          : "Cart is already empty",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};