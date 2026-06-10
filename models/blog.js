const { Schema, model } = require("mongoose");

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: { type: String, unique: true, index: true },
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
    excerpt: { type: String, maxlength: 300 },
    tags: [{ type: String, trim: true, lowercase: true }],
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "PUBLISHED",
    },
    readingTime: { type: Number, min: 1 },
    views: { type: Number, default: 0, min: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "user" }],
    coverImageURL: {
      type: String,
      default: "/uploads/default.jpg",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "user" }],
  },
  { timestamps: true }
);

blogSchema.index({ title: "text", excerpt: "text", tags: "text" });

const Blog = model("blog", blogSchema);

module.exports = Blog;
