const { Router } = require("express");
const blogController = require("../controllers/blogController");
const asyncHandler = require("../middlewares/asyncHandler");
const { requireAuth } = require("../middlewares/auth");
const { blogImageUpload } = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const {
  blogIdValidator,
  createBlogValidator,
  updateBlogValidator,
  commentValidator,
} = require("../validators/blogValidators");

const router = Router();

router.get("/", asyncHandler(blogController.getAllBlogs));
router.get(
  "/:id",
  blogIdValidator,
  validate,
  asyncHandler(blogController.getBlog)
);
router.post(
  "/",
  requireAuth,
  blogImageUpload.single("coverImage"),
  createBlogValidator,
  validate,
  asyncHandler(blogController.createBlog)
);
router.patch(
  "/:id",
  requireAuth,
  blogImageUpload.single("coverImage"),
  updateBlogValidator,
  validate,
  asyncHandler(blogController.updateBlog)
);
router.delete(
  "/:id",
  requireAuth,
  blogIdValidator,
  validate,
  asyncHandler(blogController.deleteBlog)
);
router.post(
  "/:id/comments",
  requireAuth,
  commentValidator,
  validate,
  asyncHandler(blogController.addComment)
);
router.put(
  "/:id/bookmark",
  requireAuth,
  blogIdValidator,
  validate,
  asyncHandler(blogController.addBookmark)
);
router.delete(
  "/:id/bookmark",
  requireAuth,
  blogIdValidator,
  validate,
  asyncHandler(blogController.removeBookmark)
);

module.exports = router;
