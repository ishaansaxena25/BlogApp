const User = require("../models/user");
const Blog = require("../models/blog");
const { createTokenforUser } = require("../services/JWTauth");
const { uploadFile, deleteStoredFile } = require("../services/storage");

function publicUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    profileImageURL: user.profileImageURL,
    role: user.role,
    bio: user.bio,
    github: user.github,
    linkedin: user.linkedin,
    twitter: user.twitter,
    website: user.website,
  };
}

async function getProfile(req, res) {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const blogs = await Blog.find({ createdBy: user._id }).sort({
    createdAt: -1,
  });
  return res.status(200).json({ user: publicUser(user), blogs });
}

async function updateProfile(req, res) {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const oldProfileImageUrl = user.profileImageURL;
  if (req.body.fullName !== undefined) user.fullName = req.body.fullName;
  if (req.body.email !== undefined) user.email = req.body.email;
  for (const field of ["bio", "github", "linkedin", "twitter", "website"]) {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  }
  if (req.file) user.profileImageURL = await uploadFile(req.file, "profile");
  await user.save();
  req.filePersisted = Boolean(req.file);

  if (req.file) {
    await deleteStoredFile(oldProfileImageUrl);
  }

  const token = createTokenforUser(user);
  return res.status(200).json({ token, user: publicUser(user) });
}

async function changePassword(req, res) {
  try {
    const newPassword = await User.ChangePass(
      req.user._id,
      req.body.oldPassword,
      req.body.newPassword
    );
    await User.findByIdAndUpdate(req.user._id, { password: newPassword });
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(400).json({ error: "Current password is incorrect" });
  }
}

async function getBookmarks(req, res) {
  const blogs = await Blog.find({ bookmarks: req.user._id })
    .populate("createdBy", "fullName profileImageURL")
    .sort({ createdAt: -1 });
  return res.status(200).json({ blogs });
}

module.exports = { getProfile, updateProfile, changePassword, getBookmarks };
