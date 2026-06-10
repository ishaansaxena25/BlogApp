const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcrypt");
const { BCRYPT_COST, hashPassword } = require("../services/passwords");

test("new user passwords are hashed with bcrypt cost 12", async () => {
  const hash = await hashPassword("plain-password");
  assert.equal(await bcrypt.compare("plain-password", hash), true);
  assert.equal(Number(hash.split("$")[2]), BCRYPT_COST);
});
