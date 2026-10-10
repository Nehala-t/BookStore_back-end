import Cart from "../models/Cart.js";
import Book from "../models/Book.js";
import Checkout from "../models/Checkout.js";
import ShippingAddress from "../models/ShippingAddress.js";
import HttpError from "../utils/httpError.js";

export const CreateCheckout = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    // Only users can checkout
    if (req.user.role !== "user") {
      return next(
        new HttpError(
          "Only users can create checkout",
          403
        )
      );
    }

    const userId = req.user.user_id;

    const {
      shippingAddressId,
      paymentMethod,
    } = req.body;

    // Validate shipping address
    if (!shippingAddressId) {
      return next(
        new HttpError(
          "Shipping address is required",
          400
        )
      );
    }

    // Find shipping address
    const shippingAddress =
      await ShippingAddress.findOne({
        _id: shippingAddressId,
        userId,
        isDeleted: false,
      });

    if (!shippingAddress) {
      return next(
        new HttpError(
          "Shipping address not found",
          404
        )
      );
    }

    // Get active cart items
    const cartItems = await Cart.find({
      userId,
      isDeleted: false,
    }).populate("bookId");

    if (!cartItems || cartItems.length === 0) {
      return next(
        new HttpError("Cart is empty", 400)
      );
    }

    // Check valid books
    const validCartItems = cartItems.filter(
      (item) =>
        item.bookId &&
        item.bookId.isDeleted !== true &&
        item.bookId.status === "available"
    );

    if (validCartItems.length === 0) {
      return next(
        new HttpError(
          "No valid books in cart",
          400
        )
      );
    }

    // Check stock
    for (const item of validCartItems) {
      if (item.quantity > item.bookId.stock) {
        return next(
          new HttpError(
            `Only ${item.bookId.stock} copies of "${item.bookId.title}" are available`,
            400
          )
        );
      }
    }

    // Prepare checkout products
    const checkoutProducts =
      validCartItems.map((item) => ({
        bookId: item.bookId._id,

        quantity: item.quantity,

        price:
          item.bookId.discountPrice ??
          item.bookId.price,

        orderStatus: "pending",

        isDeleted: false,
      }));

    // Calculate total
    const totalAmount =
      validCartItems.reduce(
        (total, item) => {
          const price =
            item.bookId.discountPrice ??
            item.bookId.price;

          return (
            total +
            price * item.quantity
          );
        },
        0
      );

    // Create checkout
    const checkout = new Checkout({
      userId,

      products: checkoutProducts,

      totalAmount,

      shippingAddress:
        shippingAddress._id,

      paymentMethod:
        paymentMethod || "COD",

      paymentStatus: "pending",

      isDeleted: false,
    });

    await checkout.save();

    // Soft delete cart items
    await Cart.updateMany(
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

    return res.status(201).json({
      success: true,
      message:
        "Checkout created successfully",
      data: checkout,
    });
  } catch (error) {
    console.error(
      "CreateCheckout Error:",
      error
    );

    next(error);
  }
};


// ==========================================
// VIEW CHECKOUT
// ==========================================

export const ViewCheckout = async (
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

    // Only users can view checkout
    if (req.user.role !== "user") {
      return next(
        new HttpError(
          "Only users can view checkout",
          403
        )
      );
    }

    const userId = req.user.user_id;

    const checkout = await Checkout.find({
      userId,
      isDeleted: false,
    })
      .populate("products.bookId")
      .populate("shippingAddress")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Checkout fetched successfully",
      data: checkout,
    });
  } catch (error) {
    console.error(
      "ViewCheckout Error:",
      error
    );

    next(error);
  }
};


