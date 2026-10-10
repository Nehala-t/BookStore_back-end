import express from "express";

import {
  AddWishList,
  ViewWishList,
  RemoveWishlist,
  ClearWishlist,
} from "../controllers/wishListController.js";

import {authMiddleware} from "../middlware/authMiddleware.js";


const router = express.Router();


router.post(
  "/addWishList",
  authMiddleware,
  AddWishList
);


router.get(
  "/viewWishList",
  authMiddleware,
  ViewWishList
);


router.delete(
  "/removeWishList/:bookId",
  authMiddleware,
  RemoveWishlist
);


router.delete(
  "/clearWishList",
  authMiddleware,
  ClearWishlist
);


export default router;