import { body } from "express-validator";

export const bookValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Book title is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Book title must be between 2 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Book description is required")
    .isLength({ min: 20, max: 1000 })
    .withMessage("Description must be between 20 and 1000 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a valid positive number"),

  body("discountPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount price must be a valid positive number"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),

  body("author")
    .trim()
    .notEmpty()
    .withMessage("Author name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Author name must be between 2 and 100 characters"),

  body("isbn")
    .trim()
    .notEmpty()
    .withMessage("ISBN is required")
    .isLength({ min: 10, max: 17 })
    .withMessage("ISBN must be between 10 and 17 characters"),

  body("publisher")
    .trim()
    .notEmpty()
    .withMessage("Publisher is required"),

  body("publicationDate")
    .notEmpty()
    .withMessage("Publication date is required")
    .isISO8601()
    .withMessage("Publication date must be a valid date"),

  body("pages")
    .notEmpty()
    .withMessage("Number of pages is required")
    .isInt({ min: 1 })
    .withMessage("Pages must be at least 1"),

  body("language")
    .trim()
    .notEmpty()
    .withMessage("Language is required"),

  body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0 })
    .withMessage("Stock cannot be negative"),
];