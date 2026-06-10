const Blog = require("../models/blog");
const Comment = require("../models/comment");
const CacheService = require("./CacheService");
const { uploadFile, deleteStoredFile } = require("./storage");
const { sanitizeEditorContent } = require("./editorContent");
const { isValidObjectId } = require("mongoose");
const {
  calculateReadingTime,
  createExcerpt,
  createUniqueSlug,
} = require("./blogMetadata");

const BLOG_CACHE_KEY = "blogs:all";
const TRENDING_CACHE_KEY = "blogs:trending";

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

  async listBlogs({ status, user } = {}) {
    if (status === "draft") {
      if (!user) return [];
      return this.Blog.find({
        status: "DRAFT",
        ...(user.role !== "ADMIN" && { createdBy: user._id }),
      })
        .populate("createdBy", "fullName profileImageURL")
        .sort({ createdAt: -1 });
    }

    const cachedBlogs = await this.cache.get(BLOG_CACHE_KEY);
    if (cachedBlogs) return cachedBlogs;

    const blogs = await this.Blog.find({ status: "PUBLISHED" })
      .populate("createdBy", "fullName profileImageURL")
      .sort({ createdAt: -1 });
    await this.cache.set(BLOG_CACHE_KEY, blogs);
    return blogs;
  }

  async getBlog(identifier, user) {
    const query = isValidObjectId(identifier)
      ? { _id: identifier }
      : { slug: identifier };
    const blog = await this.Blog.findOne(query).populate(
      "createdBy",
      "fullName profileImageURL"
    );
    if (!blog) return null;
    const ownerId = blog.createdBy?._id || blog.createdBy;
    if (
      blog.status === "DRAFT" &&
      (!user ||
        (user.role !== "ADMIN" && ownerId.toString() !== user._id.toString()))
    ) {
      return null;
    }

    const comments = await this.Comment.find({ BlogId: blog._id })
      .populate("UserId", "fullName profileImageURL")
      .sort({ _id: 1 });
    const bookmarked = Boolean(
      user &&
        blog.bookmarks.some(
          (userId) => userId.toString() === user._id.toString()
        )
    );
    const liked = Boolean(
      user &&
        blog.likes.some(
          (userId) => userId.toString() === user._id.toString()
        )
    );

    return { blog, comments, bookmarked, liked };
  }

  async createBlog({ title, content, excerpt, tags, status, userId, file }) {
    const coverImageURL = await uploadFile(file, "uploads");
    const sanitizedContent = sanitizeEditorContent(content);
    const blog = await this.Blog.create({
      title,
      slug: await createUniqueSlug(title, this.Blog),
      content: sanitizedContent,
      excerpt: excerpt || createExcerpt(sanitizedContent),
      tags: tags || [],
      status: status || "PUBLISHED",
      readingTime: calculateReadingTime(sanitizedContent),
      createdBy: userId,
      ...(coverImageURL && { coverImageURL }),
    });
    await this.cache.delete(BLOG_CACHE_KEY);
    return blog;
  }

  async updateBlog({ id, title, content, excerpt, tags, status, user, file }) {
    const blog = await this.Blog.findById(id);
    if (!blog) return { status: "not_found" };
    if (!this.canManage(user, blog)) return { status: "forbidden" };

    const oldCoverImageUrl = blog.coverImageURL;
    if (title !== undefined && title !== blog.title) {
      blog.title = title;
      blog.slug = await createUniqueSlug(title, this.Blog, blog._id);
    }
    if (content !== undefined) {
      blog.content = sanitizeEditorContent(content);
      blog.readingTime = calculateReadingTime(blog.content);
      if (excerpt === undefined) blog.excerpt = createExcerpt(blog.content);
    }
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (tags !== undefined) blog.tags = tags;
    if (status !== undefined) blog.status = status;
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

  async setLike({ blogId, userId, liked }) {
    const blog = await this.Blog.findByIdAndUpdate(
      blogId,
      liked
        ? { $addToSet: { likes: userId } }
        : { $pull: { likes: userId } },
      { new: true }
    );
    if (!blog) return null;
    await this.cache.delete(BLOG_CACHE_KEY, TRENDING_CACHE_KEY);
    return { likesCount: blog.likes.length, liked };
  }

  async incrementViews(blogId) {
    const blog = await this.Blog.findByIdAndUpdate(
      blogId,
      { $inc: { views: 1 } },
      { new: true, projection: { views: 1 } }
    );
    if (!blog) return null;
    await this.cache.delete(BLOG_CACHE_KEY, TRENDING_CACHE_KEY);
    return blog.views;
  }

  async getTrending() {
    const cached = await this.cache.get(TRENDING_CACHE_KEY);
    if (cached) return cached;
    const blogs = await this.Blog.find({ status: "PUBLISHED" })
      .populate("createdBy", "fullName profileImageURL")
      .sort({ views: -1, createdAt: -1 })
      .limit(10);
    await this.cache.set(TRENDING_CACHE_KEY, blogs, 600);
    return blogs;
  }
}

BlogService.BLOG_CACHE_KEY = BLOG_CACHE_KEY;
BlogService.TRENDING_CACHE_KEY = TRENDING_CACHE_KEY;

module.exports = BlogService;
