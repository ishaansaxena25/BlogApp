const { createHmac, hash } = require("crypto");
const { Schema, model } = require("mongoose");
const { createTokenforUser } = require("../services/authentication");
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
});

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return;

  const salt = crypto.randomUUID().toString();

  const hashedpass = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");
  console.log(hashedpass);
  this.salt = salt;
  this.password = hashedpass;
  console.log("success");
  next();
});

userSchema.static("matchPass", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("user not found");

  const salt = user.salt;
  const hashedpass = user.password;
  const inpPass = createHmac("sha256", salt).update(password).digest("hex");

  if (hashedpass !== inpPass) throw new Error("incorrect password");

  const token = createTokenforUser(user);
  return token;
  //   return hashedpass === inpPass;
});

const User = model("user", userSchema);

module.exports = User;
