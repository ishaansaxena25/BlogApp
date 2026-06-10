const test = require("node:test");
const assert = require("node:assert/strict");
const {
  calculateReadingTime,
  createExcerpt,
  createUniqueSlug,
} = require("../services/blogMetadata");

test("blog metadata is derived from Editor.js text blocks", () => {
  const content = {
    blocks: [
      { type: "header", data: { text: "A heading" } },
      { type: "paragraph", data: { text: "<b>Hello</b> world" } },
      { type: "image", data: { caption: "ignored" } },
    ],
  };
  assert.equal(createExcerpt(content), "Hello world");
  assert.equal(calculateReadingTime(content), 1);
});

test("slug generation appends a suffix on collision", async () => {
  let calls = 0;
  const BlogModel = {
    async exists() {
      calls += 1;
      return calls === 1;
    },
  };
  const slug = await createUniqueSlug("Hello World", BlogModel);
  assert.match(slug, /^hello-world-[a-f0-9]{6}$/);
});
