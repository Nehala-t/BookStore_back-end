import express from "express";

import {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";
import { updateProfileValidation } from "../validaters/updateProfileValidation.js";
import { validaterMiddleware } from "../middlware/validaterMiddleware.js";

import { authMiddleware } from "../middlware/authMiddleware.js";

const router = express.Router();
// Current logged-in user's profile
router.get(
  "/profile",
  authMiddleware,
  getMyProfile
);

// Current logged-in user/seller can update their own profile
router.put(
  "/update",
  updateProfileValidation,
  validaterMiddleware,
  updateMyProfile
);

// Admin - get all users
router.get(
  "/all",
  authMiddleware,
  getAllUsers
);

// Admin - get user by ID
router.get(
  "/:id",
  authMiddleware,
  getUserById
);

// Admin - update user role
router.put(
  "/:id/role",
  authMiddleware,
  updateUserRole
);

// Admin - delete user
router.delete(
  "/:id",
  authMiddleware,
  deleteUser
);

export default router;