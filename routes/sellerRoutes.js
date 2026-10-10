import express from "express";

import {
  getSellerProfile,
  getSellerBooks,
  getSellerDashboard,
} from "../controllers/sellerController.js";

import {authMiddleware} from "../middlware/authMiddleware.js";


const router = express.Router();


router.get(
  "/profile",
  authMiddleware,
  getSellerProfile
);


router.get(
  "/books",
  authMiddleware,
  getSellerBooks
);

router.get(
  "/dashboard",
  authMiddleware,
  getSellerDashboard
);


export default router;