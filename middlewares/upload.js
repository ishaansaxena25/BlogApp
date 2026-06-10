const multer = require("multer");

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

function createImageUpload() {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileSize },
    fileFilter(req, file, callback) {
      if (!allowedMimeTypes.has(file.mimetype)) {
        const error = new Error("Only JPEG, PNG, and WebP images are allowed");
        error.status = 400;
        return callback(error);
      }

      return callback(null, true);
    },
  });
}

const blogImageUpload = createImageUpload();
const profileImageUpload = createImageUpload();

module.exports = { blogImageUpload, profileImageUpload };
