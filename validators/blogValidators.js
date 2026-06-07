const { body, param } = require("express-validator");

const blogIdValidator = [
  param("id").isMongoId().withMessage("A valid blog ID is required"),
];

const createBlogValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("body").trim().notEmpty().withMessage("Body is required"),
];

const updateBlogValidator = [
  ...blogIdValidator,
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("body")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Body cannot be empty"),
];

const commentValidator = [
  ...blogIdValidator,
  body("content").trim().notEmpty().withMessage("Comment content is required"),
];

module.exports = {
  blogIdValidator,
  createBlogValidator,
  updateBlogValidator,
  commentValidator,
};
