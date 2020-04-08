const express = require("express");
const feedController = require("../controllers/feed");
const { body } = require("express-validator");
const router = express.Router();

// Routes

// Feed Routes
router.get("/posts", feedController.getPosts);
router.get("/posts/:postId", feedController.getPost);
router.post(
  "/posts",
  [
    body("title").trim().isLength({ min: 7 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

module.exports = router;
