const { Router } = require("express");
const userController = require("../controllers/userController");
const asyncHandler = require("../middlewares/asyncHandler");
const { requireAuth } = require("../middlewares/auth");
const { profileImageUpload } = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const {
  updateProfileValidator,
  changePasswordValidator,
} = require("../validators/authValidators");

const router = Router();

router.use(requireAuth);
router.get("/me", asyncHandler(userController.getProfile));
router.patch(
  "/me",
  profileImageUpload.single("profileImage"),
  updateProfileValidator,
  validate,
  asyncHandler(userController.updateProfile)
);
router.patch(
  "/me/password",
  changePasswordValidator,
  validate,
  asyncHandler(userController.changePassword)
);
router.get("/me/bookmarks", asyncHandler(userController.getBookmarks));

module.exports = router;
