import express, { Router } from "express";
import { authMiddleware  } from "../middlware/authMiddleware.js";
import { getSellerInventory, updateStock, increaseStock, decreaseStock, } from "../controllers/inventoryController.js"




const router = express.Router();

// Get seller inventory
router.get(
  "/getSellerInventory",
  authMiddleware,
  getSellerInventory
);

// Update stock directly
router.put(
  "/updateStock/:id",
  authMiddleware,
  updateStock
);

// Increase stock
router.put(
  "/increaseStock/:id",
  authMiddleware,
  increaseStock
);

// Decrease stock
router.put(
  "/decreaseStock/:id",
  authMiddleware,
  decreaseStock
);

export default router;
