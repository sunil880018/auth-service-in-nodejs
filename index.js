const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// const csrf = require("csurf");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const { protect } = require("./middleware/auth");
const Post = require("./models/postModel");
const config = require("./config");

mongoose
  .connect(config.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("database connected"));

const app = express();

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3001",
  })
);
app.use(cookieParser());
app.use(express.json());

// app.use(
//   csrf({
//     cookie: true,
//   })
// );

app.get("/", protect, (req, res) => {
  res.send("hello");
});

app.post("/users/signup", async (req, res) => {
  console.log(req.body.username)
  const { username, password } = req.body;
  try {
    const hashpassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({ username, password: hashpassword });
    newUser.password = undefined;
    res.status(201).json({
      user: newUser,
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      status: "fail",
    });
  }
});

app.get("/posts", protect, async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(400).json({
      status: "fail",
    });
  }
});

app.post("/posts", protect, async (req, res) => {
  const { title, content } = req.body;
  try {
    const newPost = await Post.create({ title, content });
    res.json(newPost);
  } catch (err) {
    res.status(400).json({
      status: "fail",
    });
  }
});

app.get("/users/profile", protect, (req, res) => {
  const { user } = req;
  user.password = null;
  res.json({ user });
});




app.post("/users/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(403).json({
        message: "Incorrect Username or password",
      });
    }

    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      return res.status(403).json({
        message: "incorrect username or password",
      });
    }

    const currentTime = Date.now();
    const expiresAt = currentTime + 1 * 60 * 60 * 1000;

    // JWT sign method is used to creating a token the take are three arguments one is a response object, 
    // and the second one is a secret key and the last one is an options object for better use of the token.
    const token = jwt.sign(
      { id: user._id, exp: expiresAt }, // data object
      config.ACCESS_JWT_SECRET // app secrey key
    );

    user.password = undefined;
    res.cookie("token", token, {
      // expires: new Date(Date.now() + 1*60*60*1000),
      expires: new Date(expiresAt),
      //   httpOnly: true,
      secure: false, // needs to be true in production
    });
    res.status(200).json({
      //   tokenType: "Bearer",
      //   token,
      user,
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      status: "fail",
    });
  }
});

app.post("/users/logout", protect, (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "successfully logged out" });
});

app.listen(3000, () => console.log("listening on port 3000"));
