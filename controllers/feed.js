const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

const Post = require("../models/post");

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((postData) => {
      if (!postData) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }

      clearImage(postData.imageUrl);

      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      res.status(200).json({ message: "deleted post" });
    })
    .catch((err) => {
      console.log(err);
    });
};
function clearImage(filePath) {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
}

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req).errors;
  console.log(errors);

  if (errors.length >= 1) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file == null ? req.body.image : req.file.path;

  if (!imageUrl) {
    const error = new Error("no file picked.");
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((postData) => {
      if (!postData) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }

      if (imageUrl != postData.imageUrl) {
        clearImage(postData.imageUrl);
      }

      postData.title = title;
      postData.content = content;
      postData.imageUrl = imageUrl;

      return postData.save();
    })
    .then((result) => {
      res.status(200).json({ message: "post updated", post: result });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res
        .status(200)
        .json({
          message: "Fetched post succesfully",
          posts: posts,
          totalItems: totalItems,
        });
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
  const errors = validationResult(req).errors;
  console.log(errors);

  if (errors.length >= 1) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  // console.log("file-path", req.file.path);

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
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
