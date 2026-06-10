const { Router } = require("express");
const blogController = require("../controllers/blogController");
const asyncHandler = require("../middlewares/asyncHandler");
const { requireAuth } = require("../middlewares/auth");
const { blogImageUpload } = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const {
  blogIdValidator,
  blogIdentifierValidator,
  createBlogValidator,
  updateBlogValidator,
  commentValidator,
  commentMutationValidator,
  updateCommentValidator,
} = require("../validators/blogValidators");

const router = Router();

router.get("/", asyncHandler(blogController.getAllBlogs));
router.get("/trending", asyncHandler(blogController.getTrending));
router.get(
  "/:id",
  blogIdentifierValidator,
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
  "/:blogId/comments/:commentId",
  requireAuth,
  updateCommentValidator,
  validate,
  asyncHandler(blogController.updateComment)
);
router.delete(
  "/:blogId/comments/:commentId",
  requireAuth,
  commentMutationValidator,
  validate,
  asyncHandler(blogController.deleteComment)
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
router.put(
  "/:id/like",
  requireAuth,
  blogIdValidator,
  validate,
  asyncHandler(blogController.addLike)
);
router.delete(
  "/:id/like",
  requireAuth,
  blogIdValidator,
  validate,
  asyncHandler(blogController.removeLike)
);
router.post(
  "/:id/view",
  blogIdValidator,
  validate,
  asyncHandler(blogController.incrementViews)
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
