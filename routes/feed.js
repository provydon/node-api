const express = require("express");
const feedController = require("../controllers/feed");
const router = express.Router();

// Routes

// Feed Routes
router.get("/posts", feedController.getPost);
router.post("/posts", feedController.createPost);

module.exports = router;
