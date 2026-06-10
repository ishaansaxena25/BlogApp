const path = require("path");
const { randomUUID } = require("crypto");
const LocalStorageService = require("./LocalStorageService");
const R2StorageService = require("./R2StorageService");

const r2Variables = [
  "R2_ENDPOINT",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_URL",
];

function createStorageService() {
  const configured = r2Variables.filter((name) => process.env[name]);
  if (configured.length === r2Variables.length) {
    return new R2StorageService({
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      bucket: process.env.R2_BUCKET,
      publicUrl: process.env.R2_PUBLIC_URL,
    });
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.STORAGE_DRIVER !== "local"
  ) {
    throw new Error(
      "Cloudflare R2 must be fully configured in production, or STORAGE_DRIVER=local must be explicitly set"
    );
  }

  return new LocalStorageService();
}

function createStorageKey(folder, file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const basename = path
    .basename(file.originalname, extension)
    .replace(/[^a-z0-9_-]/gi, "-")
    .slice(0, 60);
  return `${folder}/${Date.now()}-${randomUUID()}-${basename}${extension}`;
}

const storageService = createStorageService();

async function uploadFile(file, folder) {
  if (!file) return null;
  const key = createStorageKey(folder, file);
  const url = await storageService.upload(file.buffer, key, file.mimetype);
  file.storageKey = key;
  file.location = url;
  return url;
}

async function deleteStoredFile(url) {
  if (
    !url ||
    url === "/default.png" ||
    url === "/profile/default.png" ||
    url === "/uploads/default.jpg"
  ) {
    return;
  }
  await storageService.delete(storageService.getKey(url));
}

module.exports = {
  storageService,
  createStorageService,
  createStorageKey,
  uploadFile,
  deleteStoredFile,
};
