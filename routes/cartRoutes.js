import express from "express";

import { authMiddleware } from "../middlware/authMiddleware.js";

import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/addCart", authMiddleware, addToCart);

router.get("/viewCart", authMiddleware, getCart);

router.put(
  "/update/:bookId",
  authMiddleware,
  updateCartQuantity
);

router.delete(
  "/remove/:bookId",
  authMiddleware,
  removeFromCart
);

router.delete(
  "/clear",
  authMiddleware,
  clearCart
);

export default router;