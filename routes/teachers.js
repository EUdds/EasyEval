var flash = require('express-flash');
var express = require('express');
var session = require('express-session')
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var cookieParser = require('cookie-parser');

var app = express();
var sessionStore = new session.MemoryStore;
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser('secret'));
var router = express.Router();
app.use(session({ secret: 'keyboard cat' }));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(flash());
router.use(expressValidator());

passport.use('My-Strag',new LocalStrategy({
    passReqToCallback: true 
  },
     function(username, password, done){
 
 User.getUserByUsername(username, function(){
     if(err) throw err;
     if(!user){
         return done(null, false, {message: 'Unknown User'});
     }
 
     User.comparePassword(password, user.password, function(err, isMatch){
         if(err) throw err;
         if(isMatch){
             return done(null, user);
         }else{
             return done(null, false, {message: 'Invalid Password'});
         }
     })
 })
 
 }));






router.get('/', function(req,res){
	res.render('teacher',{
        layout: 'teacherSide.handlebars',
        title: 'EasyEval- Teachers'
    });
});

router.get('/register',  function(req,res){
	res.render('register',{
        layout: 'teacherSide.handlebars',
        title: 'EasyEval- Register'
    });
});

router.post('/register', function(req,res){
    var name = req.body.name;
    var email= req.body.email;
    var username = req.body.usename;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Name is Required').notEmpty();
    req.checkBody('email', 'Email is Required').notEmpty();
    req.checkBody('email', 'Email is not Valid').isEmail();
    req.checkBody('username', 'Userame is Required').notEmpty();
    req.checkBody('password', 'Password is Required').notEmpty();
    req.checkBody('password2', 'Passwords must Match').equals(req.body.password);

    //Errors
    var errors = req.validationErrors();
    

    if(errors){
        console.log(`This is an error ` + req.validationErrors);
        res.render('register',{
            errors: errors,
            layout: 'teacherSide.handlebars'
        })
    }else{
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        User.createUser(newUser, function(err, user){
            if(err) throw err
            console.log(user);
        });
        
      //  req.flash('success', 'You have successfully registered and can login');

        res.location('/teachers');
        res.redirect('/teachers');
    }
});

router.get('/login', function(req,res){
	res.render('login',{
        layout: 'teacherSide.handlebars',
        title: 'EasyEval- Login'
    });
});

router.post('/login',
  passport.authenticate('My-Strag', 
    {
        failureRedirect: '/teachers/login',
        failureFlash: 'Invalid username or password'
    }),
  function(req, res) {
    //req.flash('success', 'You are now logged in!');
    res.redirect('/');
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