const express = require("express");
const feedController = require("../controllers/feed");
const { body } = require("express-validator");
const router = express.Router();
const isAuth = require("../middlewares/is-auth");

// Routes

// Feed Routes
router.get("/posts", isAuth, feedController.getPosts);
router.get("/posts/:postId", isAuth, feedController.getPost);
router.post(
  "/posts",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

router.put(
  "/posts/:postId",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.updatePost
);

router.delete("/posts/:postId", isAuth, feedController.deletePost);

module.exports = router;
