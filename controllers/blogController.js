const BlogService = require("../services/BlogService");

const blogService = new BlogService();

async function getAllBlogs(req, res) {
  const blogs = await blogService.listBlogs({
    status: req.query.status,
    user: req.user,
    search: req.query.search?.trim(),
    tag: req.query.tag?.trim(),
  });
  return res.status(200).json({ blogs });
}

async function getBlog(req, res) {
  const result = await blogService.getBlog(req.params.id, req.user);
  if (!result) {
    return res.status(404).json({ error: "Blog not found" });
  }
  return res.status(200).json(result);
}

async function createBlog(req, res) {
  const blog = await blogService.createBlog({
    title: req.body.title,
    content: req.body.content,
    excerpt: req.body.excerpt,
    tags: req.body.tags,
    status: req.body.status,
    userId: req.user._id,
    file: req.file,
  });
  req.filePersisted = Boolean(req.file);
  return res.status(201).json({ blog });
}

async function updateBlog(req, res) {
  const result = await blogService.updateBlog({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    excerpt: req.body.excerpt,
    tags: req.body.tags,
    status: req.body.status,
    user: req.user,
    file: req.file,
  });
  if (result.status === "not_found") {
    return res.status(404).json({ error: "Blog not found" });
  }
  if (result.status === "forbidden") {
    return res.status(403).json({ error: "You cannot update this blog" });
  }
  req.filePersisted = Boolean(req.file);
  return res.status(200).json({ blog: result.blog });
}

async function deleteBlog(req, res) {
  const result = await blogService.deleteBlog({
    id: req.params.id,
    user: req.user,
  });
  if (result.status === "not_found") {
    return res.status(404).json({ error: "Blog not found" });
  }
  if (result.status === "forbidden") {
    return res.status(403).json({ error: "You cannot delete this blog" });
  }
  return res.status(204).send();
}

async function addComment(req, res) {
  const comment = await blogService.addComment({
    blogId: req.params.id,
    content: req.body.content,
    userId: req.user._id,
  });
  if (!comment) {
    return res.status(404).json({ error: "Blog not found" });
  }
  return res.status(201).json({ comment });
}

async function addBookmark(req, res) {
  const blog = await blogService.setBookmark({
    blogId: req.params.id,
    userId: req.user._id,
    bookmarked: true,
  });
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  }

  return res.status(200).json({ blog });
}

async function removeBookmark(req, res) {
  const blog = await blogService.setBookmark({
    blogId: req.params.id,
    userId: req.user._id,
    bookmarked: false,
  });
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  }

  return res.status(200).json({ blog });
}

async function addLike(req, res) {
  const result = await blogService.setLike({
    blogId: req.params.id,
    userId: req.user._id,
    liked: true,
  });
  if (!result) return res.status(404).json({ error: "Blog not found" });
  return res.status(200).json(result);
}

async function removeLike(req, res) {
  const result = await blogService.setLike({
    blogId: req.params.id,
    userId: req.user._id,
    liked: false,
  });
  if (!result) return res.status(404).json({ error: "Blog not found" });
  return res.status(200).json(result);
}

async function incrementViews(req, res) {
  const views = await blogService.incrementViews(req.params.id);
  if (views === null) return res.status(404).json({ error: "Blog not found" });
  return res.status(200).json({ views });
}

async function getTrending(req, res) {
  const blogs = await blogService.getTrending();
  return res.status(200).json({ blogs });
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
  addLike,
  removeLike,
  incrementViews,
  getTrending,
};
