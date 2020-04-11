const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const io = require("../socket");
const User = require("../models/user");
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

      if (postData.creator.toString() != req.userId) {
        const error = new Error("Not Authorized.");
        error.statusCode = 403;
        throw error;
      }

      clearImage(postData.imageUrl);

      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then((user) => {
      io.getIo().emit("posts", {
        action: "delete",
        post: postId,
      });
      res.status(200).json({ message: "post updated", post: result });
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
    .populate("creator")
    .then((postData) => {
      if (!postData) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }

      if (postData.creator._id.toString() != req.userId) {
        const error = new Error("Not Authorized.");
        error.statusCode = 403;
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
      io.getIo().emit("posts", {
        action: "update",
        post: result,
      });
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
        .populate("creator")
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({
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
  let creator;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });

  // Save Post
  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      // Create post in db
      creator = user;
      user.posts.push(post);
      return user.save();
      console.log(user);
    })
    .then((result) => {
      io.getIo().emit("post", {
        action: "create",
        post: {
          ...post._doc,
          creator: { _id: req.userId, name: creator.name },
        },
      });
      return res.status(201).json({
        message: "Post created succesfully",
        post: post,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
