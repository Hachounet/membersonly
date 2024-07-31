const { Router } = require("express");
const asyncHandler = require("express-async-handler");
const { getLandingPage } = require("../controllers/indexController");

const queries = require("../db/queries");

const indexRouter = Router();

indexRouter.get("/", getLandingPage);

module.exports = indexRouter;
