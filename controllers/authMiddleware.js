const queries = require("../db/queries");

module.exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.body.isAuth = true;
    next();
  } else {
    next();
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin) {
    next();
  } else {
    res.status(401).json({
      msg: "You are not authorized to view this resource because you are not admin.",
    });
  }
};

module.exports.isMember = (req, res, next) => {
  console.log(req.user);

  next();
};
