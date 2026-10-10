
import { body } from "express-validator";

export const registerValidation = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required"),

  body("email")
        .notEmpty()
        .withMessage("Name is required")
        .isEmail()
        .withMessage("Please enter a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
];

export const loginValidation = [
    body("email")
        .notEmpty()
        .withMessage("Name is required")
        .isEmail()
    .withMessage("Please enter a valid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
]