	var port = 8000;
	var serverUrl = "127.0.0.1";
	var inputData;
	var numInGroup;
	var firstName;
	var groupMemberNames;
	var boxesCreated;
	var chosenProject;
  var standards;
  var isExisting = false;
	var evalData = {
	  groupMembers: null
	};

	var express = require('express'),
	  app = module.exports.app = express();
	var http = require("http").Server(app);
	var path = require("path");
	var fs = require("fs");
	var bodyParser = require('body-parser');
	var session = require('express-session');
	var passport = require('passport');
	var ExpressValidator = require('express-validator');
	var LocalStrategy = require('passport-local').Strategy;
	var multer = require('multer');
	var upload = multer({
	  dest: './uploads'
	});
	var flash = require('express-flash');
	var mongo = require('mongodb');
	var mongoose = require('mongoose');
	var db = mongoose.connection;
	var bcrypt = require('bcryptjs');
	var User = require('./models/user');
	var Project = require('./models/project');
	var passportConfig = require('./config/passport');
	var io = require('socket.io')(http);
	var xcell = require('./excel');

	exphbs = require('express3-handlebars'),
	  app.engine('handlebars', exphbs({
	    defaultLayout: 'main'
	  }));
	app.set('view engine', 'handlebars');

	app.use(express.static('public'));
	app.use(bodyParser.urlencoded({
	  extended: true
	}));
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
	  errorFormatter: function (param, msg, value) {
	    var namespace = param.split('.'),
	      root = namespace.shift(),
	      formParam = root;

	    while (namespace.length) {
	      formParam += '[' * namespace.shift(); + ']';
	    }
	    return {
	      param: formParam,
	      msg: msg,
	      value: value
	    };
	  }
	}));

	app.use(flash());
	app.get('*', function (req, res, next) {
	  res.locals.user = req.user || null;
	  next();
	})

	// app.use(function (req, res, next) {
	// 	res.status(404).render('404');
	// })

	postLogin = function (req, res, next) {
	  req.assert('email', 'Email is not valid').isEmail();
	  req.assert('password', 'Password cannot be blank').notEmpty();
	  req.sanitize('email').normalizeEmail();

	  var errors = req.validationErrors();
	  if (errors) {
	    console.log(errors);
	    req.flash('errors', errors);
	    return res.redirect('/teachers/login');
	  }
	  passport.authenticate('local', function (err, user, info) {
	    if (err) {
	      return next(err);
	    }
	    if (!user) {
	      req.flash('errors', info);
	      return res.redirect('/teachers/login');
	    }
	    req.logIn(user, function (err) {
	      if (err) {
	        return next(err);
	      }
	      return res.redirect('/teachers/dashboard');
	    });
	  })(req, res, next);
	};

	postSignup = function (req, res, next) {
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

	  User.findOne({
	    email: req.body.email
	  }, function (err, existingUser) {
	    if (existingUser) {
	      req.flash('errors', {
	        msg: 'Account with that email address already exists.'
	      });
	      return res.redirect('/teachers/register');
	    }
	    User.findOne({
	      lower: req.body.username.toLowerCase()
	    }, function (err, existingUser) {
	      if (existingUser) {
	        req.flash('errors', {
	          msg: 'Account with that username address already exists.'
	        });
	        return res.redirect('/teachers/register');
	      }
	      user.save(function (err) {
	        if (err) {
	          return next(err);
	        }
	        req.logIn(user, function (err) {
	          if (err) {
	            return next(err);
	          }
	          res.redirect('/teachers');
	        });
	      });
	    });
	  });
	};
	postCreateProject = function (req, res, next) {
	  var standards = [];
	  for (var i = 0; i < req.body.numStandards; i++) {
	    standards[i] = req.body.standard[i];
	  }
	  var project = new Project({
	    projectTitle: req.body.projectName,
	    standardsInAssignment: req.body.numStandards,
	    standards: standards.toString(),
	    maxScore: req.body.maxScore,
	    creator: req.user.username,
	    connectCode: Math.floor(Math.random() * 90000) + 10000

	  });

	  Project.findOne({
	    projectTitle: req.body.projectName
	  }, function (err, existingProject) {
	    if (existingProject) {
	      req.flash('errors', {
	        msg: 'Project with that title already exists!'
	      });
	      return res.redirect('/teachers/createProject');
	    }
	    project.save(function (err) {
	      if (err) {
	        return next(err);
	      }
	      return res.redirect('/teachers/dashboard');
	    });
	  });
	};

	oldShowResults = function (req, res, next) {
	  Project.findOne({
	    connectCode: req.params.code
	  }, function (err, project) {
	    if (err) {
	      req.flash('errors', {
	        msg: 'Unknown Project'
	      });
	      return res.redirect('/teachers');
	    }
	    if (!req.user) {
	      req.flash('errors', {
	        msg: 'You must sign in to view that'
	      });
	      return res.redirect('/teachers/login');
	    } else {
	      if (project.creator != req.user.username) {
	        req.flash('errors', {
	          msg: 'You are not authorized to access this project!'
	        });
	        return res.redirect('/teachers');
	      }
	      User.findOne({
	        username: project.creator
	      }, function (err, user) {
	        var projectData = [];
	        for (var i = 0; i < user.submissions.length; i++) {
	          console.log(user.submissions[i].id);
	          if (user.submissions[i].id == project.connectCode) {
	            projectData[i] = user.submissions[i];
	            console.log(user.submissions[i].id + ' , ' + project.connectCode);
	          }
	        }

	        var standardsArray = project.standards.split(',');

	        res.render('results', {
	          layout: 'teacherSide.handlebars',
	          title: 'EasyEval - Results',
	          project: project,
	          evalData: projectData,
	          standards: standardsArray
	        });
	      });
	    }
	  });
	}

	function sleep(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
	}
	var checkMimeType = true;

	console.log("Starting web server at " + serverUrl + ":" + port);

	http.listen(port);

	app.get('/', function (req, res) {
	  res.render('enterPin');
	});

	app.post('/eval', function (req, res) {
	  Project.findOne({
	    connectCode: req.body.id
	  }, function (err, project) {
	    if (err) console.log(err);
	      Project.update({
	          connectCode: project.connectCode
	        }, {	
	          $push: {
	            submissions: req.body
	          }
	        },
	        function (err) {
	          if (err) console.log(err);
	    });
	  });
		req.flash('success', {msg: 'Successfully Submitted to Teacher!'})
	  return res.redirect('/');

	});

	io.on('connection', function (socket) {
	  socket.broadcast.emit('hi');
	  socket.on('disconnect', function () {});

	  socket.on('groupEval', function (value) {
	    evalData.groupMembers = value;
	  });
	});


	app.post('/', function (req, res) {
	  Project.findOne({
	    connectCode: req.body.pinNumber
	  }, function (err, project) {
	    if (!project) {
	      req.flash('errors', {
	        msg: 'Game Pin Not Reconized, Try Again'
	      });
	      return res.redirect('/');
	    }
	    chosenProject = project;
	    res.render('startGroup', {
	      project: project
	    })
	  })
	});


	app.get('/evaluate', function (req, res) {
	  res.redirect('/');
	});


	app.post('/evaluate', function (req, res) {
	  firstName = req.body.firstName;
	  numInGroup = req.body.numInGroup;
	  groupNumber = req.body.groupNumber;
	  res.render('evaluate', {
	    firstName: firstName,
	    numInGroup: numInGroup,
      project: chosenProject,
      groupNumber: groupNumber
	  });
	});

	app.get('/teachers/dashboard', passportConfig.isAuthenticated, function (req, res) {
	  Project.find({
	    creator: req.user.username
	  }, function (err, projects) {
	    res.render('teacher', {
	      layout: 'teacherSide.handlebars',
	      title: 'EasyEval- Teachers',
	      projects: projects,
	      standards: standards
	    });
	  });
	});

	app.get('/teachers', function(req, res){
		res.render('welcome',{
			layout: 'teacherSide.handlebars',
			title: 'EasyEval - Teachers'
		});
	});

	app.get('/teachers/register', function (req, res) {
	  res.render('register', {
	    layout: 'teacherSide.handlebars',
	    title: 'EasyEval- Register'
	  });
	});

	app.post('/teachers/register', postSignup);

	app.get('/teachers/login', function (req, res) {
	  res.render('login', {
	    layout: 'teacherSide.handlebars',
	    title: 'EasyEval- Login'
	  });
	});

	app.post('/teachers/login', postLogin);

	app.get('/teachers/logout', function (req, res) {
	  req.logout();
	  req.flash('success', {
	    msg: 'Successfully Logged Out'
	  });
	  res.redirect('/teachers/login');
	})

	app.get('/teachers/createProject', passportConfig.isAuthenticated, function (req, res) {
	  res.render('createProject', {
	    layout: 'teacherSide.handlebars',
	    title: 'EasyEval- Create Project'
	  });
	});

	app.get('/teachers/copyProject/:code', passportConfig.isAuthenticated, function (req, res) {
		Project.findOne({connectCode: req.params.code}, function(err, project){
			if(err){
				req.flash('errors', {msg: "That project doesn't exist!"});
				 return res.redirect('/teachers/dashboard');
			}
			if(project.creator != req.user.username){
				req.flash('errors', {msg: 'You are not authorized to view that project'});
				res.redirect('/teachers/dashboard');
			}
			res.render('createProject', {
				layout: 'teacherSide.handlebars',
				title: 'EasyEval- Create Project',
				project: project	
			});
	
		})
		
	});

	app.get('/teachers/deleteProject/:code', passportConfig.isAuthenticated, function(req,res){
		Project.findOne({connectCode: req.params.code}, function(err, project){
			if(err){
				req.flash('errors', {msg: "That project doesn't exist!"});
				res.redirect('/teachers/dashboard');
			}
			if(project.creator != req.user.username){
				req.flash('errors', {msg:'You are not authorized to delete that project!'});
				res.redirect('/teachers/dashboard');
			}
			var proj = Project.findOne().remove({connectCode: project.connectCode});
			proj.exec();
			res.redirect('/teachers/dashboard');
		});
		
	})

	app.post('/teachers/createProject', postCreateProject);

  app.get('/teachers/results/:code', function (req, res) {
    Project.findOne({
      connectCode: req.params.code
	  }, function (err, project) {
      if (err) console.log(err);
      if (!req.user) {
        req.flash('errors', {
          msg: 'You must sign in to view that'
	      });
	      return res.redirect('/teachers/login');
	    }
      if(project.creator = req.user.username){
        xcell.exportResults(req.params.code);
        var d = new Date();
        var file = String('./' + project.projectTitle + "_" + (d.getMonth() + 1) + d.getDate() + '.xlsx');
        setTimeout(function(){res.download(file)}, 5000);
        setTimeout(function(){fs.unlinkSync(file, function(err){
          if(err) throw err;
        })}, 10000);
      }else{
        req.flash('error', {msg: "You're not authorized to view that!"});
        res.redirect('/teachers/dashboard');
      }
	  })
	});



	passport.serializeUser(function (user, done) {
	  done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
	  User.getUserById(id, function (err, user) {
	    done(err, user);
	  });
	});


	module.exports = app;
