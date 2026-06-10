const fs = require("fs/promises");
const path = require("path");
const StorageService = require("./StorageService");

class LocalStorageService extends StorageService {
  constructor({ publicDirectory = path.resolve("public") } = {}) {
    super();
    this.publicDirectory = publicDirectory;
  }

  resolveKey(key) {
    const normalized = key.replace(/\\/g, "/").replace(/^\/+/, "");
    const absolutePath = path.resolve(this.publicDirectory, normalized);
    const relative = path.relative(this.publicDirectory, absolutePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("Invalid storage key");
    }
    return absolutePath;
  }

  async upload(buffer, key) {
    const absolutePath = this.resolveKey(key);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);
    return this.getUrl(key);
  }

  async delete(key) {
    if (!key) return;
    try {
      await fs.unlink(this.resolveKey(key));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  getUrl(key) {
    return `/${key.replace(/\\/g, "/").replace(/^\/+/, "")}`;
  }

  getKey(url) {
    return url.replace(/^\/+/, "");
  }
}

module.exports = LocalStorageService;
