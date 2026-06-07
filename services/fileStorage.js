const fs = require("fs/promises");
const path = require("path");

const publicDirectory = path.resolve("public");
const protectedFiles = new Set([
  "/default.png",
  "/profile/default.png",
  "/uploads/default.jpg",
]);

async function deletePublicFile(publicUrl) {
  if (!publicUrl || protectedFiles.has(publicUrl)) {
    return;
  }

  const relativePath = publicUrl.replace(/^[/\\]+/, "");
  const absolutePath = path.resolve(publicDirectory, relativePath);
  const relativeToPublic = path.relative(publicDirectory, absolutePath);

  if (relativeToPublic.startsWith("..") || path.isAbsolute(relativeToPublic)) {
    throw new Error("Refusing to delete a file outside the public directory");
  }

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

async function deleteUploadedFile(file) {
  if (!file?.path) {
    return;
  }

  try {
    await fs.unlink(file.path);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

module.exports = { deletePublicFile, deleteUploadedFile };
