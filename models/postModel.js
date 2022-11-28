const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    require: [true, "post must have title"],
  },
  content: {
    type: String,
    require: [true, "post must have content"],
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
