const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { getRedisClient } = require("../config/redis");
const {
  deletePublicFile,
  deleteUploadedFile,
} = require("../services/fileStorage");

const BLOG_CACHE_KEY = "blogs:all";
const cacheTtl = Number(process.env.CACHE_TTL_SECONDS) || 60;

async function invalidateBlogCache() {
  const redisClient = await getRedisClient();
  if (redisClient) {
    await redisClient.del(BLOG_CACHE_KEY);
  }
}

function canManageBlog(req, blog) {
  return (
    req.user.role === "ADMIN" ||
    blog.createdBy.toString() === req.user._id.toString()
  );
}

async function getAllBlogs(req, res) {
  const redisClient = await getRedisClient();
  if (redisClient) {
    const cachedBlogs = await redisClient.get(BLOG_CACHE_KEY);
    if (cachedBlogs) {
      return res.status(200).json({ blogs: JSON.parse(cachedBlogs) });
    }
  }

  const blogs = await Blog.find({})
    .populate("createdBy", "fullName profileImageURL")
    .sort({ createdAt: -1 });

  if (redisClient) {
    await redisClient.setEx(BLOG_CACHE_KEY, cacheTtl, JSON.stringify(blogs));
  }

  return res.status(200).json({ blogs });
}

async function getBlog(req, res) {
  const blog = await Blog.findById(req.params.id).populate(
    "createdBy",
    "fullName profileImageURL"
  );
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  }

  const comments = await Comment.find({ BlogId: blog._id })
    .populate("UserId", "fullName profileImageURL")
    .sort({ _id: 1 });
  const bookmarked = Boolean(
    req.user &&
      blog.bookmarks.some(
        (userId) => userId.toString() === req.user._id.toString()
      )
  );

  return res.status(200).json({ blog, comments, bookmarked });
}

async function createBlog(req, res) {
  const blog = await Blog.create({
    title: req.body.title,
    body: req.body.body,
    createdBy: req.user._id,
    ...(req.file && { coverImageURL: `/uploads/${req.file.filename}` }),
  });
  req.filePersisted = Boolean(req.file);
  await invalidateBlogCache();

  return res.status(201).json({ blog });
}

async function updateBlog(req, res) {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    await deleteUploadedFile(req.file);
    return res.status(404).json({ error: "Blog not found" });
  }
  if (!canManageBlog(req, blog)) {
    await deleteUploadedFile(req.file);
    return res.status(403).json({ error: "You cannot update this blog" });
  }

  const oldCoverImageUrl = blog.coverImageURL;
  if (req.body.title !== undefined) blog.title = req.body.title;
  if (req.body.body !== undefined) blog.body = req.body.body;
  if (req.file) blog.coverImageURL = `/uploads/${req.file.filename}`;
  await blog.save();
  req.filePersisted = Boolean(req.file);

  if (req.file) {
    await deletePublicFile(oldCoverImageUrl);
  }
  await invalidateBlogCache();

  return res.status(200).json({ blog });
}

async function deleteBlog(req, res) {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  }
  if (!canManageBlog(req, blog)) {
    return res.status(403).json({ error: "You cannot delete this blog" });
  }

  await Promise.all([
    Comment.deleteMany({ BlogId: blog._id }),
    Blog.findByIdAndDelete(blog._id),
  ]);
  await deletePublicFile(blog.coverImageURL);
  await invalidateBlogCache();

  return res.status(204).send();
}

async function addComment(req, res) {
  const blogExists = await Blog.exists({ _id: req.params.id });
  if (!blogExists) {
    return res.status(404).json({ error: "Blog not found" });
  }

  const comment = await Comment.create({
    content: req.body.content,
    BlogId: req.params.id,
    UserId: req.user._id,
  });

  return res.status(201).json({ comment });
}

async function addBookmark(req, res) {
  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { bookmarks: req.user._id } },
    { new: true }
  );
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  }

  return res.status(200).json({ blog });
}

async function removeBookmark(req, res) {
  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    { $pull: { bookmarks: req.user._id } },
    { new: true }
  );
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  }

  return res.status(200).json({ blog });
}

module.exports = {
  getAllBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
  addBookmark,
  removeBookmark,
};
