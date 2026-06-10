const JWT = require("jsonwebtoken");
const User = require("../models/user");
const { blacklistToken } = require("../services/tokenBlacklist");
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

async function register(req, res) {
  const existingUser = await User.exists({ email: req.body.email });
  if (existingUser) {
    return res.status(409).json({ error: "A user with this email already exists" });
  }

  const profileImageURL = await uploadFile(req.file, "profile");
  const user = await User.create({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    ...(profileImageURL && { profileImageURL }),
  });
  req.filePersisted = Boolean(req.file);
  const token = await User.matchPass(req.body.email, req.body.password);

  return res.status(201).json({ token, user: publicUser(user) });
}

async function login(req, res) {
  try {
    const token = await User.matchPass(req.body.email, req.body.password);
    const user = await User.findOne({ email: req.body.email });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return res.status(200).json({ token, user: publicUser(user) });
  } catch (error) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }
}

async function logout(req, res) {
  const decodedToken = JWT.decode(req.token);
  if (req.token && decodedToken?.exp) {
    blacklistToken(req.token, decodedToken.exp * 1000);
  }

  res.clearCookie("token");
  return res.status(200).json({ message: "Logged out successfully" });
}

module.exports = { register, login, logout };
