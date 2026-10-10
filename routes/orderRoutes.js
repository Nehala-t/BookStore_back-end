import express from "express";
import {
  ViewOrderById,
  updateOrderStatus,
  cancelOrderItem ,
  getSellerOrders,
  RemoveOrder,
  getAdminOrders
} from "../controllers/orderController.js";

import {authMiddleware} from "../middlware/authMiddleware.js";

const router = express.Router();


// ==========================================
// USER ORDER ROUTES
// ==========================================

// View all orders
// router.get(
//   "/viewOrders",
//   authMiddleware,
//   ViewOrders
// );


// View single order
router.get(
  "/viewOrder/:orderId",
  authMiddleware,
  ViewOrderById
);


// Cancel individual book

router.put(
  "/cancelOrderItem/:orderId/:itemId",
  authMiddleware,
  cancelOrderItem
);

// Remove order from order history
router.patch(
  "/removeOrder/:orderId",
  authMiddleware,
  RemoveOrder
);


// ==========================================
// SELLER ORDER ROUTES
// ==========================================

// View seller orders
router.get(
  "/sellerOrders",
  authMiddleware,
  getSellerOrders
);


// Update product order status
router.patch(
  "/updateOrderStatus/:orderId",
  authMiddleware,
  updateOrderStatus
);


router.get(
  "/adminOrders",
  getAdminOrders
);

export default router;