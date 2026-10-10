import express from "express";

import {
  addReview,
  getBookReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

import { authMiddleware } from "../middlware/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addReview);

router.get(
  "/book/:bookId",
  authMiddleware,
  getBookReviews
);

router.get(
  "/:id",
  authMiddleware,
  getReviewById
);

router.put(
  "/:id",
  authMiddleware,
  updateReview
);

router.delete(
  "/:id",
  authMiddleware,
  deleteReview
);

export default router;