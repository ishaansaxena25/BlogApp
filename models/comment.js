const { Schema, model } = require("mongoose");

const commentSchema = new Schema({
  content: {
    type: String,
  },
  BlogId: {
    type: Schema.Types.ObjectId,
    ref: "blog",
  },
  UserId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
});

const Comment = model("comment", commentSchema);

module.exports = Comment;
