exports.getPost = (req, res, next) => {
  return res
    .status(200)
    .json({ posts: [{ title: "first post", content: "this is first post!" }] });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;

  // Create post in db
  return res.status(201).json({
    message: "Post created succesfully",
    post: { id: new Date().toISOString, title: title, content: content },
  });
};
