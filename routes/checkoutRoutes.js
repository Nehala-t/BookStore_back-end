import express from "express";

import {
  CreateCheckout,
  ViewCheckout
} from "../controllers/checkoutController.js";

import {authMiddleware} from "../middlware/authMiddleware.js";

const router = express.Router();


// Create checkout
router.post(
  "/createCheckout",
  authMiddleware,
  CreateCheckout
);


// View checkout
router.get(
  "/viewCheckout",
  authMiddleware,
  ViewCheckout
);




export default router;