import express from "express";

import {
  AddAddress,
  ViewAddresses,
  ViewAddress,
  UpdateAddress,
  SetDefaultAddress,
  DeleteAddress,
} from "../controllers/shippingAddressController.js";

import {authMiddleware} from "../middlware/authMiddleware.js";

const router = express.Router();

// ======================================================
// ADD ADDRESS
// ======================================================

router.post(
  "/addAddress",
  authMiddleware,
  AddAddress
);

// ======================================================
// VIEW ALL ADDRESSES
// ======================================================

router.get(
  "/viewAddresses",
  authMiddleware,
  ViewAddresses
);

// ======================================================
// VIEW SINGLE ADDRESS
// ======================================================

router.get(
  "/viewAddress/:id",
  authMiddleware,
  ViewAddress
);

// ======================================================
// UPDATE ADDRESS
// ======================================================

router.put(
  "/updateAddress/:id",
  authMiddleware,
  UpdateAddress
);

// ======================================================
// SET DEFAULT ADDRESS
// ======================================================

router.put(
  "/setDefault/:id",
  authMiddleware,
  SetDefaultAddress
);

// ======================================================
// DELETE ADDRESS
// ======================================================

router.delete(
  "/deleteAddress/:id",
  authMiddleware,
  DeleteAddress
);

export default router;





