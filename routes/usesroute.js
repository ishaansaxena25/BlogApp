const { Router } = require("express");
const User = require("../models/user");
const Blog = require("../models/blog");
const multer = require("multer");
const path = require("path");
const { createTokenforUser } = require("../services/JWTauth");
const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/profile/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/signin", (req, res) => {
  return res.render("signin");
});
router.get("/signup", (req, res) => {
  return res.render("signup");
});
router.get("/edit", (req, res) => {
  if (!req.user) {
    return res.render("signin", { error: "login to edit profile" });
  }
  return res.render("editUser", {
    user: req.user,
  });
});

router.get("/changePass", (req, res) => {
  return res.render("changePass");
});

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

router.post("/signup", upload.single("profileImage"), async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!req.file) {
      await User.create({
        fullName,
        email,
        password,
      });
    } else {
      await User.create({
        fullName,
        email,
        password,
        profileImageURL: `/profile/${req.file.filename}`,
      });
    }
    return res.redirect("/");
  } catch (error) {
    return res.render("signup", {
      error: "User already exists",
    });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPass(email, password);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "incorrect email or password",
    });
  }
});

router.get("/profile", async (req, res) => {
  if (!req.user) {
    return res.render("signin", {
      error: "login to access profile",
    });
  }
  const user = await User.findById(req.user._id);
  const blogs = await Blog.find({ createdBy: user._id });
  return res.render("profile", { user, blogs });
});

router.post("/edit", upload.single("profileImage"), async (req, res) => {
  if (!req.file) {
    await User.findByIdAndUpdate(req.user._id, {
      fullName: req.body.fullName,
      email: req.body.email,
    });
  } else {
    await User.findByIdAndUpdate(req.user._id, {
      fullName: req.body.fullName,
      email: req.body.email,
      profileImageURL: `/profile/${req.file.filename}`,
    });
  }
  const userC = await User.findById(req.user._id);
  const token = createTokenforUser(userC);
  return res.cookie("token", token).redirect("/user/profile");
});
module.exports = router;
