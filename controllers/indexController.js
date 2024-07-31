exports.getLandingPage = (req, res, next) => {
  console.log("Landing Page");

  res.render("index");
};
