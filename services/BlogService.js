const Blog = require("../models/blog");
const Comment = require("../models/comment");
const CacheService = require("./CacheService");
const { uploadFile, deleteStoredFile } = require("./storage");
const { sanitizeEditorContent } = require("./editorContent");

const BLOG_CACHE_KEY = "blogs:all";

class BlogService {
  constructor({
    BlogModel = Blog,
    CommentModel = Comment,
    cache = new CacheService(),
  } = {}) {
    this.Blog = BlogModel;
    this.Comment = CommentModel;
    this.cache = cache;
  }

  canManage(user, blog) {
    return (
      user.role === "ADMIN" ||
      blog.createdBy.toString() === user._id.toString()
    );
  }

  async listBlogs() {
    const cachedBlogs = await this.cache.get(BLOG_CACHE_KEY);
    if (cachedBlogs) return cachedBlogs;

    const blogs = await this.Blog.find({})
      .populate("createdBy", "fullName profileImageURL")
      .sort({ createdAt: -1 });
    await this.cache.set(BLOG_CACHE_KEY, blogs);
    return blogs;
  }

  async getBlog(id, user) {
    const blog = await this.Blog.findById(id).populate(
      "createdBy",
      "fullName profileImageURL"
    );
    if (!blog) return null;

    const comments = await this.Comment.find({ BlogId: blog._id })
      .populate("UserId", "fullName profileImageURL")
      .sort({ _id: 1 });
    const bookmarked = Boolean(
      user &&
        blog.bookmarks.some(
          (userId) => userId.toString() === user._id.toString()
        )
    );

    return { blog, comments, bookmarked };
  }

  async createBlog({ title, content, userId, file }) {
    const coverImageURL = await uploadFile(file, "uploads");
    const blog = await this.Blog.create({
      title,
      content: sanitizeEditorContent(content),
      createdBy: userId,
      ...(coverImageURL && { coverImageURL }),
    });
    await this.cache.delete(BLOG_CACHE_KEY);
    return blog;
  }

  async updateBlog({ id, title, content, user, file }) {
    const blog = await this.Blog.findById(id);
    if (!blog) return { status: "not_found" };
    if (!this.canManage(user, blog)) return { status: "forbidden" };

    const oldCoverImageUrl = blog.coverImageURL;
    if (title !== undefined) blog.title = title;
    if (content !== undefined) blog.content = sanitizeEditorContent(content);
    if (file) blog.coverImageURL = await uploadFile(file, "uploads");
    await blog.save();

    if (file) await deleteStoredFile(oldCoverImageUrl);
    await this.cache.delete(BLOG_CACHE_KEY);
    return { status: "updated", blog };
  }

  async deleteBlog({ id, user }) {
    const blog = await this.Blog.findById(id);
    if (!blog) return { status: "not_found" };
    if (!this.canManage(user, blog)) return { status: "forbidden" };

    await Promise.all([
      this.Comment.deleteMany({ BlogId: blog._id }),
      this.Blog.findByIdAndDelete(blog._id),
    ]);
    await deleteStoredFile(blog.coverImageURL);
    await this.cache.delete(BLOG_CACHE_KEY);
    return { status: "deleted" };
  }

  async addComment({ blogId, content, userId }) {
    const blogExists = await this.Blog.exists({ _id: blogId });
    if (!blogExists) return null;

    return this.Comment.create({
      content,
      BlogId: blogId,
      UserId: userId,
    });
  }

  async setBookmark({ blogId, userId, bookmarked }) {
    return this.Blog.findByIdAndUpdate(
      blogId,
      bookmarked
        ? { $addToSet: { bookmarks: userId } }
        : { $pull: { bookmarks: userId } },
      { new: true }
    );
  }
}

BlogService.BLOG_CACHE_KEY = BLOG_CACHE_KEY;

module.exports = BlogService;
