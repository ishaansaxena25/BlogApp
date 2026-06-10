const { createHmac } = require("crypto");
const { Schema, model } = require("mongoose");
const { createTokenforUser } = require("../services/JWTauth");
const { hashPassword, comparePassword } = require("../services/passwords");
const userSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  salt: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  profileImageURL: {
    type: String,
    default: "/default.png",
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER",
  },
  hashVersion: {
    type: String,
    enum: ["hmac", "bcrypt"],
    default: "bcrypt",
  },
  bio: { type: String, maxlength: 500, default: "" },
  github: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  twitter: { type: String, default: "" },
  website: { type: String, default: "" },
});

userSchema.pre("save", async function () {
  const user = this;
  if (!user.isModified("password")) return;

  this.password = await hashPassword(user.password);
  this.hashVersion = "bcrypt";
  this.salt = undefined;
});

userSchema.static("matchPass", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("user not found");

  if (user.hashVersion === "bcrypt") {
    const matches = await comparePassword(password, user.password);
    if (!matches) throw new Error("incorrect password");
  } else {
    const inpPass = createHmac("sha256", user.salt)
      .update(password)
      .digest("hex");
    if (user.password !== inpPass) throw new Error("incorrect password");
    user.password = password;
    user.hashVersion = "bcrypt";
    await user.save();
  }

  const token = createTokenforUser(user);
  return token;
  //   return hashedpass === inpPass;
});

userSchema.static("ChangePass", async function (_id, password, newPass) {
  const user = await this.findOne({ _id });
  if (!user) throw new Error("user not found");

  const matches =
    user.hashVersion === "bcrypt"
      ? await comparePassword(password, user.password)
      : user.password ===
        createHmac("sha256", user.salt).update(password).digest("hex");
  if (!matches) throw new Error("incorrect password");

  user.password = newPass;
  user.hashVersion = "bcrypt";
  await user.save();
});

const User = model("user", userSchema);

module.exports = User;
