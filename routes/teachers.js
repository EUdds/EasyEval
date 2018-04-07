var express = require('express');
var session = require('express-session')
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var expressValidator = require('express-validator');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var cookieParser = require('cookie-parser');

app = module.exports.app;
var sessionStore = new session.MemoryStore;
app.use(cookieParser('secret'));
var router = express.Router();
app.use(session({ secret: 'keyboard cat' }));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(passport.initialize());
app.use(passport.session());
router.use(expressValidator());
app.use(flash());
app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
  });


passport.serializeUser(function(user, done) {
done(null, user.id);
});

passport.deserializeUser(function(id, done) {
User.getUserById(id, function(err, user) {
    done(err, user);
});
});

module.exports = router;