const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "1h";

const { app } = require("../index");
const { createTokenforUser } = require("../services/JWTauth");

test("GET / describes the API", async () => {
  const response = await request(app).get("/").expect(200);

  assert.equal(response.body.name, "BlogBubble API");
  assert.equal(response.body.status, "ok");
});

test("unknown routes return a JSON 404 response", async () => {
  const response = await request(app).get("/missing").expect(404);

  assert.deepEqual(response.body, { error: "Route not found" });
});

test("protected routes reject unauthenticated requests", async () => {
  const response = await request(app).get("/api/users/me").expect(401);

  assert.deepEqual(response.body, { error: "Authentication required" });
});

test("blog ID validation runs before database access", async () => {
  const response = await request(app).get("/api/blogs/not-an-id").expect(400);

  assert.equal(response.body.errors[0].path, "id");
});

test("logout blacklists the supplied bearer token", async () => {
  const token = createTokenforUser({
    _id: "507f1f77bcf86cd799439011",
    email: "user@example.com",
    profileImageURL: "/default.png",
    fullName: "Test User",
    role: "USER",
  });

  await request(app)
    .post("/api/auth/logout")
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  const response = await request(app)
    .get("/api/users/me")
    .set("Authorization", `Bearer ${token}`)
    .expect(401);

  assert.deepEqual(response.body, { error: "Authentication required" });
});
