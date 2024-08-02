const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const queries = require("../db/queries");
const pool = require("../db/pool");
const { DateTime } = require("luxon");

const length100err = "must be between 1 and 100 characters";
const length50err = "must be between 1 and 50 characters";

const validateSignUp = [
  body("uname")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage(`Username ${length50err}`)
    .escape(),
  body("firstname")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(`Firstname ${length100err}`)
    .escape(),
  body("lastname")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(`Lastname ${length100err}`)
    .escape(),
  body("password")
    .exists()
    .withMessage("Password is required.")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.confpassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

const validatePasswordClub = [
  body("secretpw")
    .exists()
    .trim()
    .custom((value) => {
      const expectedPassword = process.env.CLUBPASSWORD;
      if (value !== expectedPassword) {
        throw new Error("Password is incorrect");
      }
      return true;
    }),
];

const validatePasswordAdmin = [
  body("secretpw")
    .exists()
    .trim()
    .custom((value) => {
      const expectedPassword = process.env.ADMINPASSWORD;
      if (value !== expectedPassword) {
        throw new Error("Password is incorrect.");
      }
      return true;
    }),
];

exports.getLandingPage = (req, res, next) => {
  console.log("Landing Page");

  res.render("index");
};

exports.getSignUpPage = (req, res, next) => {
  console.log("Sign up page");

  res.render("sign-up", {
    title: "Sign up",
  });
};

exports.postSignUpPage = [
  validateSignUp,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.locals.errors = errors.array();

      res.render("sign-up", {
        title: "Sign up",
        errors: res.locals.errors,
      });
    }
    // mash pw
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }
      try {
        await pool.query(
          "INSERT INTO users (firstname, lastname, username, hash, membership, admin) VALUES ($1, $2, $3, $4, false, false)",
          [
            req.body.firstname,
            req.body.lastname,
            req.body.uname,
            hashedPassword,
          ],
        );
        res.redirect("/log-in");
      } catch (err) {
        next(err);
      }
    });
  }),
];

exports.getLoginPage = (req, res, next) => {
  console.log("Log in page");
  res.render("log-in", { title: "Log in" });
};

exports.postLoginPage = (req, res, next) => {
  console.log(req.body);
  passport.authenticate("local", {
    failureRedirect: "/log-in",
    successRedirect: "/home",
  })(req, res, next);
};

exports.getLogoutPage = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  res.redirect("/");
};

exports.getHomePage = asyncHandler(async (req, res, next) => {
  try {
    const result = await queries.getAllMessages();

    result.forEach((message) => {
      const dateTime = DateTime.fromJSDate(new Date(message.date));

      if (dateTime.isValid) {
        message.date = dateTime.toLocaleString(DateTime.DATE_MED); // Only format the date part
      } else {
        console.error("Invalid date encountered:", message.date);
        message.date = "Invalid Date";
      }
    });
    if (!req.body.isAuth || req.user.membership === false) {
      result.forEach((message) => {
        message.username = message.username
          .split("")
          .map(() => "*")
          .join("");

        message.date = "???";
      });
    }

    res.render("home", {
      title: "Home",
      messages: result,
      isAuth: req.body.isAuth,
      isAdmin: req.user && req.user.admin ? req.user.admin : false,
    });
  } catch (err) {
    next(err);
  }
});

exports.postHomePage = asyncHandler(async (req, res, next) => {
  try {
    const newDate = DateTime.now().toISODate();
    console.log(newDate);
    await pool.query(
      "INSERT INTO messages (title, date, text, author) VALUES ($1, $2, $3, $4) ",
      [req.body.title, newDate, req.body.newmessage, req.user.id],
    );
    res.redirect("/home");
  } catch (error) {
    next(error);
  }
});

exports.getJoinClubPage = asyncHandler(async (req, res, next) => {
  res.render("joinclub", { title: "Join club" });
});

exports.postJoinClubPage = [
  validatePasswordClub,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.locals.errors = errors.array();

      res.render("joinclub", {
        title: "Join club",
        errors: res.locals.errors,
      });
    }
    try {
      await pool.query("UPDATE users SET membership = true WHERE id = $1", [
        req.user.id,
      ]);
      res.redirect("/home");
    } catch (err) {
      next(err);
    }
  }),
];

exports.getAdminPage = (req, res, next) => {
  res.render("admin", { title: "Log as admin" });
};

exports.postAdminPage = [
  validatePasswordAdmin,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.locals.errors = errors.array();

      return res.render("admin", {
        title: "Log as admin",
        errors: res.locals.errors,
      });
    }
    try {
      await pool.query("UPDATE users SET admin = true WHERE id = $1", [
        req.user.id,
      ]);
      res.redirect("/home");
    } catch (err) {
      next(err);
    }
  }),
];

exports.postDeleteMessage = asyncHandler(async (req, res, next) => {
  try {
    const messageId = req.body.messageId;

    if (!req.user || !req.user.admin) {
      return res.status(403).send("Forbidden");
    }

    await pool.query("DELETE FROM messages WHERE id = $1", [messageId]);
    res.redirect("/home");
  } catch (error) {
    next(error);
  }
});
