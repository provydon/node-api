const express = require("express");
const bodyParser = require("body-parser");
const feedRoutes = require("./routes/feed");

const app = express();

app.use(bodyParser.json());

app.use("/api/v1/feed", feedRoutes);

app.listen(8080, () => {
  console.log(`Server started on port`);
});
