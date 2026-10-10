import { body } from "express-validator";

export const updateProfileValidation = [
  // User fields
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters")
    .isAlpha()
    .withMessage("First name must contain only letters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 1 })
    .withMessage("Last name must be at least 1 character")
    .isAlpha()
    .withMessage("Last name must contain only letters"),

  // Default Address
  body("defaultAddress.firstName")
    .trim()
    .notEmpty()
    .withMessage("Address first name is required")
    .isLength({ min: 2 })
    .withMessage("Address first name must be at least 2 characters")
    .isAlpha()
    .withMessage("Address first name must contain only letters"),

  body("defaultAddress.lastName")
    .trim()
    .notEmpty()
    .withMessage("Address last name is required")
    .isLength({ min: 1 })
    .withMessage("Address last name must be at least 1 character")
    .isAlpha()
    .withMessage("Address last name must contain only letters"),

  body("defaultAddress.phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please enter a valid 10-digit phone number"),

  body("defaultAddress.address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 5 })
    .withMessage("Address must be at least 5 characters"),

  body("defaultAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2 })
    .withMessage("City must be at least 2 characters")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("City must contain only letters"),

  body("defaultAddress.state")
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .isLength({ min: 2 })
    .withMessage("State must be at least 2 characters")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("State must contain only letters"),

  body("defaultAddress.pincode")
    .trim()
    .notEmpty()
    .withMessage("Pincode is required")
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage("Pincode must be a valid 6-digit number"),

  
];