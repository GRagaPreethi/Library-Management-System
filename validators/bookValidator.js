const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const createBookRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("author").trim().notEmpty().withMessage("Author is required"),
  body("isbn").trim().notEmpty().withMessage("ISBN is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("quantity")
    .notEmpty().withMessage("Quantity is required")
    .isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),
  body("description").optional().trim(),
];

const updateBookRules = [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("author").optional().trim().notEmpty().withMessage("Author cannot be empty"),
  body("isbn").optional().trim().notEmpty().withMessage("ISBN cannot be empty"),
  body("category").optional().trim().notEmpty().withMessage("Category cannot be empty"),
  body("quantity")
    .optional()
    .isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),
  body("description").optional().trim(),
];

module.exports = { createBookRules, updateBookRules, handleValidationErrors };
