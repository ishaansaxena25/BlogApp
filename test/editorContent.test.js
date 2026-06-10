const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isValidEditorContent,
  sanitizeEditorContent,
} = require("../services/editorContent");

test("Editor.js content accepts JSON strings and strips unknown blocks", () => {
  const value = JSON.stringify({
    time: 123,
    blocks: [
      { type: "paragraph", data: { text: "Hello" } },
      { type: "unsafe", data: { html: "<script />" } },
    ],
  });

  assert.equal(isValidEditorContent(value), true);
  assert.deepEqual(sanitizeEditorContent(value), {
    time: 123,
    version: undefined,
    blocks: [{ type: "paragraph", data: { text: "Hello" } }],
  });
});

test("Editor.js content rejects malformed and empty payloads", () => {
  assert.equal(isValidEditorContent("not json"), false);
  assert.equal(isValidEditorContent({ blocks: [] }), false);
});
