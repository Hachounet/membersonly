const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const queries = require("./queries");
const bcrypt = require("bcryptjs");
const { validPassword } = require("../lib/passwordUtils.js");

const customFields = {
  usernameField: "uname",
  passwordField: "pw",
};

const verifyCallback = async (username, password, done) => {
  try {
    console.log(username);
    const result = await queries.findUser(username);
    console.log("THIS IS IT", result);
    if (result.length === 0) {
      return done(null, false, { message: "Incorrect username" });
    }
    const user = result[0];
    console.log(user);
    const match = await bcrypt.compare(password, user.hash);

    if (match) {
      return done(null, user);
    } else {
      return done(null, false, { message: "Incorrect password" });
    }
  } catch (err) {
    return done(err);
  }
};

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    console.log(userId);
    const result = await queries.findUserById(userId);

    if (result.length === 0) {
      return done(null, false);
    }
    const user = result[0];
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});
