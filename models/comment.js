const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    BlogId: {
      type: Schema.Types.ObjectId,
      ref: "blog",
      required: true,
    },
    UserId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "comment",
      default: null,
    },
  },
  { timestamps: true }
);

const Comment = model("comment", commentSchema);

module.exports = Comment;
