const { Router } = require("express");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  if (!req.user?._id) {
    return res.render("signin", {
      error: "login or create account to add blogs",
    });
  }
  return res.render("addblog", {
    user: req.user,
  });
});

router.get(`/edit/:id`, async (req, res) => {
  if (!req.user?._id) {
    return res.render("signin", {
      error: "login or create account to add blogs",
    });
  }

  const blog = await Blog.findById(req.params.id);
  return res.render("editblog", {
    user: req.user,
    blog,
  });
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");

  const comments = await Comment.find({ BlogId: req.params.id }).populate(
    "UserId"
  );

  if (req.user && blog.bookmarks.find((user) => user == req.user._id)) {
    return res.render("blog", {
      user: req.user,
      blog,
      comments,
      bookmarked: "yes",
    });
  } else {
    return res.render("blog", {
      user: req.user,
      blog,
      comments,
    });
  }
});

router.post("/edit/:id", upload.single("coverImage"), async (req, res) => {
  var blog;
  if (!req.file) {
    blog = await Blog.findByIdAndUpdate(req.params.id, {
      body: req.body.body,
      title: req.body.title,
    });
  } else {
    fs.unlink(`./public/${blog.coverImageURL}`, (err) => {
      if (err) console.log(err);
    });
    blog = await Blog.findByIdAndUpdate(req.params.id, {
      body: req.body.body,
      title: req.body.title,
      coverImageURL: `/uploads/${req.file.filename}`,
    });
  }
  return res.redirect(`/blog/${blog._id}`);
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { body, title } = req.body;
  var blog;
  if (!req.file) {
    blog = await Blog.create({
      body,
      title,
      createdBy: req.user._id,
    });
  } else {
    blog = await Blog.create({
      body,
      title,
      createdBy: req.user._id,
      coverImageURL: `/uploads/${req.file.filename}`,
    });
  }
  return res.redirect(`/blog/${blog._id}`);
});

router.post("/delete/:id", async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (blog.coverImageURL != "/uploads/default.jpg") {
    fs.unlink(`./public/${blog.coverImageURL}`, (err) => {
      if (err) console.log(err);
    });
  }
  return res.redirect("/user/profile");
});

router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    BlogId: req.params.blogId,
    UserId: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/bookmark/:blogId", async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(req.params.blogId, {
    $push: { bookmarks: req.user._id },
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/Removebookmark/:blogId", async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(req.params.blogId, {
    $pull: { bookmarks: req.user._id },
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

module.exports = router;
