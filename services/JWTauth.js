const JWT = require("jsonwebtoken");

function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be configured in production");
  }

  return "development-only-secret";
}

function createTokenforUser(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    profileImageURL: user.profileImageURL,
    fullName: user.fullName,
    role: user.role,
  };

  return JWT.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function validateToken(token) {
  return JWT.verify(token, getJwtSecret());
}

module.exports = { createTokenforUser, validateToken };
