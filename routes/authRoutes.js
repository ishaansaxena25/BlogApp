const { Router } = require("express");
const authController = require("../controllers/authController");
const asyncHandler = require("../middlewares/asyncHandler");
const { requireAuth } = require("../middlewares/auth");
const { profileImageUpload } = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidators");

const router = Router();

router.post(
  "/register",
  profileImageUpload.single("profileImage"),
  registerValidator,
  validate,
  asyncHandler(authController.register)
);
router.post(
  "/login",
  loginValidator,
  validate,
  asyncHandler(authController.login)
);
router.post("/logout", requireAuth, asyncHandler(authController.logout));

module.exports = router;
