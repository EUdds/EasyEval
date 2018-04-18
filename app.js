	var port = process.env.PORT;
var serverUrl = process.env.IP;
var inputData;
var numInGroup;
var firstName;
var groupMemberNames;
var boxesCreated;
var gamePin;
var chosenProject;
var standards;

var http = require("http");
var path = require("path");
var fs = require("fs");
var ejs = require('ejs');
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
var User = require('./models/user');
var Project = require('./models/project');
var passportConfig = require('./config/passport');

var express = require('express'),
    exphbs  = require('express3-handlebars'),
	app= module.exports.app = express();
	app.engine('handlebars', exphbs({defaultLayout: 'main'}));
	app.set('view engine', 'handlebars');

	app.use(express.static('public'));
	app.use(bodyParser.urlencoded({extended : true}));
  app.use(bodyParser.json());
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
 app.get('*', function(req,res,next){
    res.locals.user = req.user || null;
    next();
  })

postLogin = function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail();
  
    var errors = req.validationErrors();
    if (errors) {
      console.log(errors);
      req.flash('errors', errors);
      return res.redirect('/teachers/login');
    }
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash('errors', info);
        return res.redirect('/teachers/login');
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        return res.redirect('/teachers');
      });
    })(req, res, next);
   };

postSignup = function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('password2', 'Passwords do not match').equals(req.body.password);
    req.sanitize('email').normalizeEmail();
  
    var errors = req.validationErrors();
  
    if (errors) {
      req.flash('errors', errors);
      return res.redirect('/teachers/register');
    }
  
    var user = new User({
      email: req.body.email,
      password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username
    });
  
    User.findOne({ email: req.body.email }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', { msg: 'Account with that email address already exists.' });
        return res.redirect('/teachers/register');
      }
      User.findOne({ lower: req.body.username.toLowerCase() }, function(err, existingUser) {
        if (existingUser) {
          req.flash('errors', { msg: 'Account with that username address already exists.' });
          return res.redirect('/teachers/register');
        }
      user.save(function(err) {
        if (err) {
          return next(err);
        }
        req.logIn(user, function(err) {
          if (err) {
            return next(err);
          }
          res.redirect('/teachers');
        });
      });
    });
  });
  };
postCreateProject = function(req, res, next) {
  var standards = [];
  for(var i=0; i<req.body.numStandards; i++){
    standards[i] = req.body.standard[i];
  }  
  var project = new Project({
      projectTitle: req.body.projectName,
      standardsInAssignment: req.body.numStandards,
        standards: standards.toString(),
        maxScore: req.body.maxScore,
        creator: req.user.username,
        connectCode: Math.floor(Math.random()*90000) + 10000

    });
  
    Project.findOne({ ProjectTitle: req.body.projectName }, function(err, existingProject) {
      if (existingProject) {
        req.flash('errors', { msg: 'Project with that title already exists!' });
        return res.redirect('/teachers/createProject');
      }
      project.save(function(err) {
        if (err) {
          return next(err);
        }  
        return res.redirect('/teachers');
        });
      });
  };



var checkMimeType = true;

console.log("Starting web server at " + serverUrl + ":" + port);

app.listen(port);

app.get('/', function(req,res){
	res.render('enterPin');
});


app.post('/', function(req,res){
   gamePin = req.body.pinNumber;
  Project.findOne({connectCode: gamePin}, function(err, project){
    if(!project){
      req.flash('errors', {msg: 'Game Pin Not Reconized, Try Again'});
      return res.redirect('/');
    }
    chosenProject = project;
    res.render('startGroup',{
      project: project
    })
  })
});
app.get('/evaluate', function(req,res){
  res.redirect('/');
});

app.post('/evaluate', function(req, res){
	firstName = req.body.firstName;
	numInGroup = req.body.numInGroup;
	groupMemberNames = req.body.groupMember0;
	res.render('evaluate', {
		firstName: firstName,
    numInGroup: numInGroup,
    project: chosenProject
    

	});
});

app.get('/teachers', function(req,res){
  Project.find({ creator: req.user.username }, function(err, projects) {
	res.render('teacher', {
      layout: 'teacherSide.handlebars',
      title: 'EasyEval- Teachers',
	  projects:   projects,
	  standards: standards
    });
  });
});

app.get('/teachers/register',  function(req,res){
	res.render('register',{
        layout: 'teacherSide.handlebars',
        title: 'EasyEval- Register'
    });
});

app.post('/teachers/register',postSignup);

app.get('/teachers/login', function(req,res){
	res.render('login',{
        layout: 'teacherSide.handlebars',
        title: 'EasyEval- Login'
    });
});

app.post('/teachers/login',postLogin);

app.get('/teachers/logout', function(req,res){
  req.logout();
  req.flash('success',{msg: 'Successfully Logged Out'});
  res.redirect('/teachers/login');
})

app.get('/teachers/createProject', function(req,res){
  res.render('createProject',{
    layout: 'teacherSide.handlebars',
    title: 'EasyEval- Create Project'
  });
});

app.get('/view', function(req,res){
  res.render('teacher',{
    layout: 'teacherSide.handlebars',
    title: 'Test Page'
  });
});

app.post('/teachers/createProject', postCreateProject);



passport.serializeUser(function(user, done) {
	done(null, user.id);
	});
	
passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
	});
	

module.exports = app;


