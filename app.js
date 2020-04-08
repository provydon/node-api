const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const feedRoutes = require("./routes/feed");
const mongoose = require("mongoose");

const MONGODB_URI =
  "mongodb+srv://provydon:Favour007.@learnnode-vywsl.mongodb.net/socials?retryWrites=true&w=majority";

const app = express();

app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use("/api/v1/feed", feedRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then((result) => {
    app.listen(8080, () => {
      console.log(`Server started on port`);
    });
  })
  .catch((err) => {});
