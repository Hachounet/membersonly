require("dotenv").config();
const express = require("express");
const pg = require("pg");
const session = require("express-session");
const passport = require("passport");
const bcryptjs = require("bcryptjs");

const pool = require("./db/pool");
const path = require("path");

const indexRouter = require("./routes/indexRouter");

const PGStore = require("connect-pg-simple")(session);

// Create express app

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const sessionStore = new PGStore({
  pool: pool,
});

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 },
  }),
);

require("./db/passport");

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  // Middleware to declare all locals variables
  res.locals.errors = [];
  res.locals.messages = [];
  res.locals.isAuth = false;
  res.locals.isAdmin = false;
  next();
});

app.use((req, res, next) => {
  // console.log(req.session);
  // console.log(req.user);
  next();
});

app.use("/", indexRouter);

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.error("Error details", {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      body: req.body,
      query: req.query,
    });

    res.status(err.status || 500).json({
      error: {
        message: err.message,
      },
    });
  } else {
    res.status(err.status || 500).send({
      error: {
        message: "An error occured. Please try again later.",
      },
    });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server launched on PORT ${PORT}`));
