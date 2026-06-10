const test = require("node:test");
const assert = require("node:assert/strict");
const CacheService = require("../services/CacheService");
const BlogService = require("../services/BlogService");

test("CacheService serializes cached values and supports graceful fallback", async () => {
  const values = new Map();
  const client = {
    async get(key) {
      return values.get(key) || null;
    },
    async setEx(key, ttl, value) {
      assert.equal(ttl, 30);
      values.set(key, value);
    },
    async del(keys) {
      for (const key of keys) values.delete(key);
    },
  };
  const cache = new CacheService({
    clientProvider: async () => client,
    defaultTtl: 30,
  });

  await cache.set("example", { ok: true });
  assert.deepEqual(await cache.get("example"), { ok: true });
  await cache.delete("example");
  assert.equal(await cache.get("example"), null);

  const unavailable = new CacheService({ clientProvider: async () => null });
  assert.equal(await unavailable.get("missing"), null);
  await unavailable.set("ignored", { ok: true });
});

test("BlogService reuses and invalidates the list cache", async () => {
  const calls = [];
  const blogs = [{ _id: "blog-1" }];
  const query = {
    populate() {
      return this;
    },
    async sort() {
      calls.push("database");
      return blogs;
    },
  };
  const BlogModel = {
    async exists() {
      return false;
    },
    find() {
      return query;
    },
    async create(payload) {
      return payload;
    },
  };
  const cache = {
    value: null,
    async get() {
      return this.value;
    },
    async set(key, value) {
      this.value = value;
    },
    async delete(key) {
      calls.push(`delete:${key}`);
      this.value = null;
    },
  };
  const service = new BlogService({ BlogModel, CommentModel: {}, cache });

  assert.deepEqual(await service.listBlogs(), blogs);
  assert.deepEqual(await service.listBlogs(), blogs);
  assert.deepEqual(calls, ["database"]);

  await service.createBlog({
    title: "Title",
    content: {
      blocks: [{ type: "paragraph", data: { text: "Body" } }],
    },
    userId: "user-1",
  });
  assert.equal(calls.at(-1), "delete:blogs:all");
});
