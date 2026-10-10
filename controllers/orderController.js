import Checkout from "../models/Checkout.js";
import HttpError from "../utils/httpError.js";
import mongoose from "mongoose";




// ==========================================
// VIEW SINGLE ORDER
// ==========================================

export const ViewOrderById = async (
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

    const userId = req.user.user_id;

    const { orderId } = req.params;

    const order = await Checkout.findOne({
      _id: orderId,
      userId,
      isDeleted: false,
    }).populate("products.productId");

    if (!order) {
      return next(
        new HttpError("Order not found", 404)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "ViewOrderById Error:",
      error
    );

    next(error);
  }
};


// ==========================================
// UPDATE ORDER STATUS - SELLER
// ==========================================

export const updateOrderStatus = async (
  req,
  res,
  next
) => {
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
    // CHECK SELLER ROLE
    // ==========================================

    if (req.user.role !== "seller") {
      return next(
        new HttpError(
          "Only sellers can update order status",
          403
        )
      );
    }

    const sellerId = req.user.user_id;

    const { orderId } = req.params;

    const {
      bookId,
      orderStatus,
    } = req.body;

    // ==========================================
    // VALIDATE BOOK ID
    // ==========================================

    if (!bookId) {
      return next(
        new HttpError(
          "Book ID is required",
          400
        )
      );
    }

    // ==========================================
    // VALIDATE STATUS
    // ==========================================

    const allowedStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return next(
        new HttpError(
          "Invalid order status",
          400
        )
      );
    }

    // ==========================================
    // FIND ORDER
    // ==========================================

    const order = await Checkout.findOne({
      _id: orderId,
      isDeleted: false,
    }).populate({
      path: "products.bookId",
      select: "title images sellerId",
    });

    if (!order) {
      return next(
        new HttpError(
          "Order not found",
          404
        )
      );
    }

    // ==========================================
    // FIND BOOK IN ORDER
    // ==========================================

    const orderProduct = order.products.find(
      (item) =>
        item.bookId &&
        item.bookId._id.toString() ===
          bookId.toString()
    );

    if (!orderProduct) {
      return next(
        new HttpError(
          "Book not found in this order",
          404
        )
      );
    }

    // ==========================================
    // CHECK SELLER OWNERSHIP
    // ==========================================

    if (
      !orderProduct.bookId.sellerId ||
      orderProduct.bookId.sellerId.toString() !==
        sellerId.toString()
    ) {
      return next(
        new HttpError(
          "You are not authorized to update this book order",
          403
        )
      );
    }

    // ==========================================
    // UPDATE STATUS
    // ==========================================

    orderProduct.orderStatus = orderStatus;

    await order.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message:
        "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "updateOrderStatus Error:",
      error
    );

    next(error);
  }
};


// ==========================================
// CANCEL ORDER - USER
// ==========================================

export const cancelOrderItem = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user || !req.user.user_id) {
      return next(
        new HttpError("Unauthorized user", 401)
      );
    }

    // Only users can cancel their books
    if (req.user.role !== "user") {
      return next(
        new HttpError(
          "Only users can cancel books",
          403
        )
      );
    }

    const userId = req.user.user_id;
    const { orderId, itemId } = req.params;

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(
        new HttpError("Invalid order ID", 400)
      );
    }

    // Validate item ID
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return next(
        new HttpError("Invalid order item ID", 400)
      );
    }

    // Find the order belonging to this user
    const order = await Checkout.findOne({
      _id: orderId,
      userId,
      isDeleted: false,
    });

    if (!order) {
      return next(
        new HttpError("Order not found", 404)
      );
    }

    // Find the individual book in the order
    const item = order.products.id(itemId);

    if (!item) {
      return next(
        new HttpError(
          "Book not found in this order",
          404
        )
      );
    }

    // Check whether this book can be cancelled
    const itemStatus = (
      item.orderStatus || order.orderStatus || "pending"
    ).toLowerCase();

    if (itemStatus === "cancelled") {
      return next(
        new HttpError(
          "This book has already been cancelled",
          400
        )
      );
    }

    if (
      ["shipped", "delivered"].includes(itemStatus)
    ) {
      return next(
        new HttpError(
          "This book cannot be cancelled because it has already been shipped or delivered",
          400
        )
      );
    }

    // Cancel only the selected book
    item.orderStatus = "cancelled";

    // Update overall order status only if all books are cancelled
    const allCancelled = order.products.every(
      (product) =>
        product.orderStatus === "cancelled"
    );

    if (allCancelled) {
      order.orderStatus = "cancelled";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Book cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("cancelOrderItem Error:", error);
    return next(error);
  }
};



// ==========================================
// GET SELLER ORDERS
// ==========================================

export const getSellerOrders = async (req, res, next) => {
  try {
    console.log("========== SELLER ORDERS ==========");
    console.log("USER:", req.user);

    // ==========================================
    // CHECK LOGIN
    // ==========================================

    if (!req.user || !req.user.user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    // ==========================================
    // CHECK SELLER ROLE
    // ==========================================

    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can view seller orders",
      });
    }

    const sellerId = req.user.user_id;

    // ==========================================
    // GET ALL ORDERS
    // ==========================================

    const orders = await Checkout.find({
      isDeleted: false,
    })
      .populate({
        path: "userId",
        select: "firstName lastName email",
      })
      .populate({
        path: "products.bookId",
        select:
          "title images price sellerId category author",
      })
      .sort({ createdAt: -1 });

    // ==========================================
    // FILTER SELLER'S PRODUCTS
    // ==========================================

    const sellerOrders = orders
      .map((order) => {
        const sellerProducts = order.products.filter(
          (product) => {
            if (!product.bookId) {
              return false;
            }

            return (
              product.bookId.sellerId?.toString() ===
              sellerId.toString()
            );
          }
        );

        // Only return orders that contain
        // at least one product belonging to seller
        if (sellerProducts.length === 0) {
          return null;
        }

        return {
          ...order.toObject(),

          products: sellerProducts,
        };
      })
      .filter(Boolean);

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Seller orders fetched successfully",
      data: sellerOrders,
    });
  } catch (error) {
    console.error("========== SELLER ORDERS ERROR ==========");
    console.error(error);

    next(error);
  }
};


// ==========================================
// REMOVE ORDER - SOFT DELETE
// ==========================================

export const RemoveOrder = async (
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

    // Only users can remove their order history
    if (req.user.role !== "user") {
      return next(
        new HttpError(
          "Only users can remove orders",
          403
        )
      );
    }

    const userId = req.user.user_id;

    const { orderId } = req.params;

    const order = await Checkout.findOne({
      _id: orderId,
      userId,
      isDeleted: false,
    });

    if (!order) {
      return next(
        new HttpError("Order not found", 404)
      );
    }

    // Soft delete
    order.isDeleted = true;

    await order.save();

    return res.status(200).json({
      success: true,
      message:
        "Order removed successfully",
    });
  } catch (error) {
    console.error(
      "RemoveOrder Error:",
      error
    );

    next(error);
  }
};


export const getAdminOrders = async (
  req,
  res,
  next
) => {
  try {
    const orders = await Checkout.find({
      isDeleted: {
        $ne: true,
      },
    })
      .populate(
        "userId",
        "firstName lastName email"
      )
      .populate(
        "products.bookId",
        "title author price image images"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Admin orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error(
      "Get Admin Orders Error:",
      error
    );

    next(error);
  }
};