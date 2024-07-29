const JWT = require("jsonwebtoken");

const secret = "de@dpool";

function createTokenforUser(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    profileImageURL: user.profileImageURL,
    fullName: user.fullName,
    role: user.role,
  };
  const token = JWT.sign(payload, secret);
  return token;
}

function validateToken(token) {
  const payload = JWT.verify(token, secret);
  return payload;
}

module.exports = {
  createTokenforUser,
  validateToken,
};
