const express = require("express");
const path = require("path");
const localURL = "mongodb://localhost:27017/blogify";

const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { checkforAuthCookie } = require("./middlewares/auth");
const app = express();
const port = process.env.PORT || 3000;

const Blog = require("./models/blog");
const userRoute = require("./routes/usesroute");
const blogRoute = require("./routes/blogroute");

mongoose.connect(process.env.CLOUD_URL).then(console.log("Mongodb Connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ urlencoded: false }));
app.use(cookieParser());
app.use(checkforAuthCookie("token"));
app.use(express.static(path.resolve("./public")));
app.get("/", async (req, res) => {
  const allBlog = await Blog.find({});
  return res.render("home", {
    user: req.user,
    blogs: allBlog,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);
app.listen(port, () => {
  console.log(`port started at ${port}`);
});
