	var port = 8000;
var serverUrl = "127.0.0.1";
var inputData;
var numInGroup;
var firstName;
var groupMemberNames;
var boxesCreated;

var http = require("http");
var path = require("path");
var fs = require("fs");
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var ExpressValidator = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
var multer = require('multer');
var upload = multer({dest: './uploads'});
var flash = require('express-flash');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;
var bcrypt = require('bcryptjs');
var User = require('../EasyEval/models/user');

var express = require('express'),
    exphbs  = require('express3-handlebars'),
	app= module.exports.app = express();
	app.engine('handlebars', exphbs({defaultLayout: 'main'}));
	app.set('view engine', 'handlebars');

	app.use(express.static('public'));
	app.use(bodyParser.urlencoded({extended : true}));
	app.use(bodyParser.json());


//var teachers = require('./routes/teachers');

//app.use('/teachers', teachers);


//Sessions
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

//Passport Austh
app.use(passport.initialize());
app.use(passport.session());

//Validator
app.use(ExpressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.')
		, root		  = namespace.shift()
		, formParam   = root;

		while(namespace.length){
			formParam += '[' * namespace.shift(); + ']';
		}
		return {
			param: formParam,
			msg  : msg,
			value: value
		};
	}
}));

app.use(flash());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});






var checkMimeType = true;

console.log("Starting web server at " + serverUrl + ":" + port);

app.listen(port);

app.get('/', function(req,res){
	res.render('startGroup');
});

app.post('/evaluate', function(req, res){
	firstName = req.body.firstName;
	numInGroup = req.body.numInGroup;
	groupMemberNames = req.body.groupMember0;
	res.render('evaluate', {
		firstName: firstName,
		numInGroup: numInGroup,

	});
});

app.get('/teachers', function(req,res){
	res.render('teacher',{
        layout: 'teacherSide.handlebars',
        title: 'EasyEval- Teachers'
    });
});

app.get('/teachers/register',  function(req,res){
	res.render('register',{
        layout: 'teacherSide.handlebars',
        title: 'EasyEval- Register'
    });
});

app.post('/teachers/register', function(req,res){
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
        res.render('register',{
            errors: errors,
			layout: 'teacherSide.handlebars',
			title: 'EasyEval-Register'
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
        
        req.flash('success', { msg: 'You have successfully registered and can login' });
        res.render("register", {
			layout: 'teacherSide.handlebars',
			title: 'EasyEval- Register'
		});
    }
});

app.get('/teachers/login', function(req,res){
	res.render('login',{
        layout: 'teacherSide.handlebars',
        title: 'EasyEval- Login'
    });
});

app.post('/teachers/login',
  passport.authenticate('local', 
    {
        failureRedirect: '/teachers/login',
		failureFlash: true,
		successRedirect: '/'

}));

passport.use(new LocalStrategy(
     function(username, password, done){
 
 User.getUserByUsername(username, function(){
     if(err) throw err;
     if(!user){
         return done(null, false, {message: 'Unknown User'});
     }
 
     User.comparePassword(password, user.password, function(err, isMatch){
         if(err) return done(err);
         if(isMatch){
             return done(null, user);
         }else{
             return done(null, false, {message: 'Invalid Password'});
         }
     })
 })
 
 }));




passport.serializeUser(function(user, done) {
	done(null, user.id);
	});
	
	passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
	});
	

module.exports = app;


