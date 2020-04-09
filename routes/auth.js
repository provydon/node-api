const express = require("express");
const authController = require("../controllers/auth");
const { body } = require("express-validator");
const router = express.Router();
const User = require("../models/user");

// Routes

// Auth Routes
router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then((userDoc) => {
            if (userDoc) {
              return Promise.reject("Email Address already exist");
            }
          })
          .catch((err) => {});
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

module.exports = router;