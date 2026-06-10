const { body } = require("express-validator");

const registerValidator = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

const loginValidator = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileValidator = [
  body("fullName").optional().trim().notEmpty(),
  body("email").optional().trim().isEmail().normalizeEmail(),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),
  ...["github", "linkedin", "twitter", "website"].map((field) =>
    body(field)
      .optional({ values: "falsy" })
      .trim()
      .isURL({ protocols: ["http", "https"], require_protocol: true })
      .withMessage(`${field} must be a valid URL`)
  ),
];

const changePasswordValidator = [
  body("oldPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long"),
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
};
