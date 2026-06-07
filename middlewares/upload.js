const fs = require("fs");
const path = require("path");
const multer = require("multer");

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

function createImageUpload(directory) {
  const absoluteDirectory = path.resolve(directory);
  fs.mkdirSync(absoluteDirectory, { recursive: true });

  const storage = multer.diskStorage({
    destination(req, file, callback) {
      callback(null, absoluteDirectory);
    },
    filename(req, file, callback) {
      const extension = path.extname(file.originalname).toLowerCase();
      const basename = path
        .basename(file.originalname, extension)
        .replace(/[^a-z0-9_-]/gi, "-")
        .slice(0, 80);
      callback(null, `${Date.now()}-${basename}${extension}`);
    },
  });

  return multer({
    storage,
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

const blogImageUpload = createImageUpload(
  process.env.UPLOAD_DIR || "public/uploads"
);
const profileImageUpload = createImageUpload(
  process.env.PROFILE_UPLOAD_DIR || "public/profile"
);

module.exports = { blogImageUpload, profileImageUpload };
