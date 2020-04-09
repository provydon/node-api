const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const mongoose = require("mongoose");
const multer = require("multer");

const MONGODB_URI =
  "mongodb+srv://provydon:Favour007.@learnnode-vywsl.mongodb.net/socials?retryWrites=true&w=majority";

const app = express();

// File  Storage
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("destination:", file);
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    console.log("filename:", file);
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jng" ||
    file.mimetype == "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use("/api/v1/feed", feedRoutes);
app.use("/api/v1/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then((result) => {
    app.listen(8080, () => {
      console.log(`Server started on port`);
    });
  })
  .catch((err) => {});
