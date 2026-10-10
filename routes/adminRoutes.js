import express from "express";
import { getAllUsers, updateUserStatus, getActiveUsersCount,getDashboardData, getAdminBooks, deleteBook } from "../controllers/adminController.js";
import { authMiddleware } from "../middlware/authMiddleware.js";



const router = express.Router();

router.get(
  "/dashboard",
  authMiddleware,
  getDashboardData
);
router.get("/getAllUsers",authMiddleware, getAllUsers);

router.put("/updateUserStatus/:userId", authMiddleware, updateUserStatus);

router.get("/getAllUsers",authMiddleware, getAllUsers);
router.get(
  "/activeUsersCount",
  authMiddleware,
  getActiveUsersCount
);

// Books for admin dashboard
router.get(
  "/books",
  authMiddleware,
  getAdminBooks
);
 

router.delete(
  "/deleteBook/:id",
  authMiddleware,
  deleteBook
);



export default router;