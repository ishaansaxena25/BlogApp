require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { optionalAuth } = require("./middlewares/auth");
const { deleteUploadedFile } = require("./services/fileStorage");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const port = process.env.PORT || 3000;
const mongoUrl =
  process.env.MONGODB_URI || "mongodb://localhost:27017/blogbubble";

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(optionalAuth);
app.use("/uploads", express.static(path.resolve("public/uploads")));
app.use("/profile", express.static(path.resolve("public/profile")));
app.use("/default.png", express.static(path.resolve("public/default.png")));

app.get("/", (req, res) => {
  res.status(200).json({
    name: "BlogBubble API",
    status: "ok",
    documentation: "/api",
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    auth: "/api/auth",
    blogs: "/api/blogs",
    users: "/api/users",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(async (err, req, res, next) => {
  if (!req.filePersisted) {
    await deleteUploadedFile(req.file).catch((cleanupError) => {
      console.error("Failed to clean up upload:", cleanupError);
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }

  console.error(err.stack || err);
  if (err?.code === 11000) {
    return res.status(409).json({ error: "A unique field already exists" });
  }
  return res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

async function startServer() {
  await mongoose.connect(mongoUrl);
  app.listen(port, () => {
    console.log(`BlogBubble API listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start BlogBubble API:", error);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
