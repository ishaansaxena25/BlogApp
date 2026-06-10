const { body, param } = require("express-validator");
const { isValidEditorContent } = require("../services/editorContent");

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
  body("content")
    .custom(isValidEditorContent)
    .withMessage("Content must contain at least one Editor.js block"),
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
  body("content")
    .optional()
    .custom(isValidEditorContent)
    .withMessage("Content must contain at least one Editor.js block"),
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
