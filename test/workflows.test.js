const test = require("node:test");
const assert = require("node:assert/strict");
const BlogService = require("../services/BlogService");

test("likes are idempotent service mutations with compact responses", async () => {
  const cacheDeletes = [];
  const BlogModel = {
    async findByIdAndUpdate(id, update) {
      assert.equal(id, "blog-1");
      assert.ok(update.$addToSet || update.$pull);
      return { likes: update.$addToSet ? ["user-1"] : [] };
    },
  };
  const service = new BlogService({
    BlogModel,
    CommentModel: {},
    cache: {
      async delete(...keys) {
        cacheDeletes.push(keys);
      },
    },
  });

  assert.deepEqual(
    await service.setLike({ blogId: "blog-1", userId: "user-1", liked: true }),
    { likesCount: 1, liked: true }
  );
  assert.deepEqual(cacheDeletes[0], ["blogs:all", "blogs:trending"]);
});

test("view increments use an atomic update and invalidate trending data", async () => {
  let receivedUpdate;
  const service = new BlogService({
    BlogModel: {
      async findByIdAndUpdate(id, update) {
        receivedUpdate = update;
        return { views: 8 };
      },
    },
    CommentModel: {},
    cache: { async delete() {} },
  });

  assert.equal(await service.incrementViews("blog-1"), 8);
  assert.deepEqual(receivedUpdate, { $inc: { views: 1 } });
});

test("comment replies cannot target another reply", async () => {
  const service = new BlogService({
    BlogModel: { async exists() { return true; } },
    CommentModel: {
      async findOne() {
        return { _id: "reply-1", parentComment: "root-1" };
      },
    },
    cache: {},
  });

  assert.deepEqual(
    await service.addComment({
      blogId: "blog-1",
      content: "Nested reply",
      userId: "user-1",
      parentComment: "reply-1",
    }),
    { error: "reply_depth" }
  );
});

test("comment deletion is restricted to its owner or an admin", async () => {
  const CommentModel = {
    async findOne() {
      return { _id: "comment-1", UserId: "owner-1" };
    },
  };
  const service = new BlogService({
    BlogModel: {},
    CommentModel,
    cache: {},
  });

  assert.deepEqual(
    await service.deleteComment({
      blogId: "blog-1",
      commentId: "comment-1",
      user: { _id: "other-user", role: "USER" },
    }),
    { status: "forbidden" }
  );
});
