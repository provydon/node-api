const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res
        .status(200)
        .json({ message: "Fetched post succesfully", posts: posts });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((postData) => {
      if (!postData) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "post fetched", post: postData });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  const errors = validationResult(req).errors;
  console.log(errors);

  if (errors.length >= 1) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const post = new Post({
    title: title,
    content: content,
    imageUrl: "images/AVATAR.png",
    creator: {
      name: "Providence",
    },
  });

  // Save Post
  post
    .save()
    .then((result) => {
      // Create post in db
      console.log(result);
      return res.status(201).json({
        message: "Post created succesfully",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
