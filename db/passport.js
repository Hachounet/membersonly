const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const queries = require("./queries");
const { validPassword } = require("../lib/passwordUtils");

const customFields = {
  usernameField: "uname",
  passwordField: "pw",
};

const verifyCallback = async (username, password, done) => {
  try {
    const result = await queries.findUser(username);

    if (result.length === 0) {
      return done(null, false);
    }
    const user = result[0];
    const isValid = validPassword(password, user.hash, user.salt);

    if (isValid) {
      return done(null, user);
    } else {
      return done(null, false);
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
