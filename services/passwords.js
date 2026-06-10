const bcrypt = require("bcrypt");

const BCRYPT_COST = 12;

function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_COST);
}

function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { BCRYPT_COST, hashPassword, comparePassword };
