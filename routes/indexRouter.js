const { Router } = require("express");
const asyncHandler = require("express-async-handler");
const {
  getLandingPage,
  getSignUpPage,
  getLoginPage,
  postSignUpPage,
  postLoginPage,
  getHomePage,
  postHomePage,
  getLogoutPage,
  getJoinClubPage,
  postJoinClubPage,
  getAdminPage,
  postAdminPage,
  postDeleteMessage,
} = require("../controllers/indexController");

const queries = require("../db/queries");
const { isAuth, isMember } = require("../controllers/authMiddleware");

const indexRouter = Router();

indexRouter.get("/", getLandingPage);

indexRouter.get("/sign-up", getSignUpPage);

indexRouter.post("/sign-up", postSignUpPage);

indexRouter.get("/log-in", getLoginPage);

indexRouter.post("/log-in", postLoginPage);

indexRouter.get("/home", isAuth, isMember, getHomePage);

indexRouter.post("/home", postHomePage);

indexRouter.get("/log-out", getLogoutPage);

indexRouter.get("/joinclub", getJoinClubPage);

indexRouter.post("/joinclub", postJoinClubPage);

indexRouter.get("/admin", getAdminPage);

indexRouter.post("/admin", postAdminPage);

indexRouter.post("/home-delete", postDeleteMessage);

module.exports = indexRouter;
