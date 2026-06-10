const { body, param } = require("express-validator");
const { isValidEditorContent } = require("../services/editorContent");

const blogIdValidator = [
  param("id").isMongoId().withMessage("A valid blog ID is required"),
];

const blogIdentifierValidator = [
  param("id")
    .trim()
    .notEmpty()
    .matches(/^[a-z0-9-]+$/i)
    .withMessage("A valid blog ID or slug is required"),
];

const metadataValidators = [
  body("status")
    .optional()
    .isIn(["DRAFT", "PUBLISHED"])
    .withMessage("Status must be DRAFT or PUBLISHED"),
  body("excerpt")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Excerpt cannot exceed 300 characters"),
  body("tags")
    .optional()
    .customSanitizer((value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          return value.split(",").map((tag) => tag.trim()).filter(Boolean);
        }
      }
      return value;
    })
    .isArray({ max: 10 })
    .withMessage("Tags must be an array of at most 10 items"),
  body("tags.*")
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: 40 })
    .withMessage("Each tag must be between 1 and 40 characters"),
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
  ...metadataValidators,
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
  ...metadataValidators,
];

const commentValidator = [
  ...blogIdValidator,
  body("content").trim().notEmpty().withMessage("Comment content is required"),
  body("parentComment").optional().isMongoId().withMessage("Invalid parent comment"),
];

const commentMutationValidator = [
  param("blogId").isMongoId().withMessage("A valid blog ID is required"),
  param("commentId").isMongoId().withMessage("A valid comment ID is required"),
];

const updateCommentValidator = [
  ...commentMutationValidator,
  body("content").trim().notEmpty().withMessage("Comment content is required"),
];

module.exports = {
  blogIdValidator,
  blogIdentifierValidator,
  createBlogValidator,
  updateBlogValidator,
  commentValidator,
  commentMutationValidator,
  updateCommentValidator,
};
