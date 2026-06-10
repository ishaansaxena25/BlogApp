const { Router } = require("express");
const { requireAuth } = require("../middlewares/auth");
const { blogImageUpload } = require("../middlewares/upload");
const asyncHandler = require("../middlewares/asyncHandler");
const uploadController = require("../controllers/uploadController");

const router = Router();

router.post(
  "/editor-image",
  requireAuth,
  blogImageUpload.single("image"),
  asyncHandler(uploadController.uploadEditorImage)
);

module.exports = router;
