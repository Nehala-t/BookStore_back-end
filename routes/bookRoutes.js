import express, { Router } from "express";
import { validaterMiddleware } from "../middlware/validaterMiddleware.js";
import { bookValidation } from "../validaters/bookValidater.js";
import { addBook, editBook, getAllBooks, deleteBook, viewSingleBook, getAllSellerBook } from "../controllers/bookController.js";
import { authMiddleware } from "../middlware/authMiddleware.js";
import upload from "../middlware/uploadMiddleware.js";




const router = express.Router();

router.post("/addBook", authMiddleware, upload.array("images", 5), bookValidation, validaterMiddleware, addBook);

router.get(
    "/getAllBooks",
    authMiddleware,
    getAllBooks
);

router.patch("/editBook/:id", authMiddleware, upload.array("images", 5), bookValidation, validaterMiddleware, editBook);

router.delete("/deleteBook/:id", authMiddleware, deleteBook);

router.get("/viewSingleBook/:id", viewSingleBook);

router.get(
  "/getAllSellerBook",
  authMiddleware,
  getAllSellerBook
);


export default router;