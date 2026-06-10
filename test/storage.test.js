const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("os");
const path = require("path");
const fs = require("fs/promises");
const LocalStorageService = require("../services/storage/LocalStorageService");
const StorageService = require("../services/storage/StorageService");

test("StorageService requires concrete implementations", async () => {
  const storage = new StorageService();
  await assert.rejects(storage.upload(Buffer.from("x"), "x", "text/plain"));
  await assert.rejects(storage.delete("x"));
  assert.throws(() => storage.getUrl("x"));
});

test("LocalStorageService uploads and deletes within its public directory", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "blogbubble-"));
  const storage = new LocalStorageService({ publicDirectory: directory });

  const url = await storage.upload(Buffer.from("image"), "uploads/test.jpg");
  assert.equal(url, "/uploads/test.jpg");
  assert.equal(
    await fs.readFile(path.join(directory, "uploads", "test.jpg"), "utf8"),
    "image"
  );

  await storage.delete(storage.getKey(url));
  await assert.rejects(fs.access(path.join(directory, "uploads", "test.jpg")));
  assert.throws(() => storage.resolveKey("../outside.jpg"));
});
