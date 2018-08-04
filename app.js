	require('dotenv').load();

	var port = 5000;
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


	//All libraries were written and owned by their respective owners

	const nodemailer = require('nodemailer');
	var sgTransport = require('nodemailer-sendgrid-transport');
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
	var sitemap = require('express-sitemap');
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
	var favicon = require('serve-favicon');
	var cookieSession = require('cookie-session');
	var async = require('async');
	var crypto = require('crypto');
	var keys = require('./config/keys');

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

	app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


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

	//Passport Auth
	app.use(passport.initialize());
	app.use(passport.session());

	app.use(flash());
	app.get('*', function (req, res, next) {
		res.locals.user = req.user || null;
		next();
	})
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
			User.find({
				username: req.body.username
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
		var isPointWeight;
		if (req.body.isPointWeight == "on") {
			isPointWeight = true;
		} else {
			isPointWeight = false;
		}
		for (var i = 0; i < req.body.numStandards; i++) {
			standards[i] = req.body.standard[i];
		}

		var project = new Project({
			projectTitle: String(req.body.projectName),
			standardsInAssignment: req.body.numStandards,
			standards: String(standards),
			maxScore: req.body.maxScore,
			creator: req.user.username,
			connectCode: Math.floor(Math.random() * 90000) + 10000,
			isPointWeight: isPointWeight,
			dateCreated: new Date()

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

	var checkMimeType = true;

	console.log("Starting web server at " + serverUrl + ":" + port);
	http.listen(port);



	app.get('/', function (req, res) {
		res.render('enterPin');
	});

	app.post('/eval', function (req, res) {
		console.log("posting");
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
		req.flash('success', {
			msg: 'Successfully Submitted to Teacher!'
		})
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
					msg: 'Pin Not Reconized, Try Again'
				});
				return res.redirect('/');
			}
			chosenProject = project;
			res.render('startGroup', {
				project: project
			})
		})
	});

	app.get('/demo', function(req,res){
		Project.findOne({connectCode: 37421}, function(err, project){
			if(err){
				res.redirect('/');
			}
			res.render('evaluate',{
				firstName: "John Doe",
				numInGroup: 2,
				project: project,
				groupNumber: 1,
				demo: true
				
			})
		})
		
	})
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
				standards: standards,
				active: {
					Projects: true,
					About: false
				}
			});
		});
	});

	app.get('/teachers', function (req, res) {
		res.render('landing', {
			layout: 'teacherSide.handlebars',
			title: 'EasyEval - Teachers',
			active: {
				Projects: false,
				About: true
			}
		});
	});

	app.get('/teachers/register', function (req, res) {
		res.render('register', {
			layout: 'teacherSide.handlebars',
			title: 'EasyEval- Register',
			active: {
				Projects: false,
				About: false,
				Login: false,
				Register: true
			}
		});
	});

	app.post('/teachers/register', postSignup);

	app.get('/teachers/login', function (req, res) {
		res.render('login', {
			layout: 'teacherSide.handlebars',
			title: 'EasyEval- Login',
			active: {
				Projects: false,
				About: false,
				Login: true,
				Register: false
			}
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
		Project.findOne({
			connectCode: req.params.code
		}, function (err, project) {
			if (err) {
				req.flash('errors', {
					msg: "That project doesn't exist!"
				});
				return res.redirect('/teachers/dashboard');
			}
			if (project.creator != req.user.username) {
				req.flash('errors', {
					msg: 'You are not authorized to view that project'
				});
				res.redirect('/teachers/dashboard');
			}
			res.render('createProject', {
				layout: 'teacherSide.handlebars',
				title: 'EasyEval- Create Project',
				project: project
			});

		})

	});

	app.get('/teachers/deleteProject/:code', passportConfig.isAuthenticated, function (req, res) {
		Project.findOne({
			connectCode: req.params.code
		}, function (err, project) {
			if (err) {
				req.flash('errors', {
					msg: "That project doesn't exist!"
				});
				res.redirect('/teachers/dashboard');
			}
			if (project.creator != req.user.username) {
				req.flash('errors', {
					msg: 'You are not authorized to delete that project!'
				});
				res.redirect('/teachers/dashboard');
			}
			var proj = Project.findOne().remove({
				connectCode: project.connectCode
			});
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
			if (project.creator = req.user.username) {
				xcell.exportResults(req.params.code);
				var d = new Date();
				var file = String('./' + project.projectTitle + "_" + (d.getMonth() + 1) + d.getDate() + '.xlsx');
				setTimeout(function () {
					res.download(file)
				}, 5000);
				setTimeout(function () {
					fs.unlinkSync(file, function (err) {
						if (err) throw err;
					})
				}, 10000);
			} else {
				req.flash('error', {
					msg: "You're not authorized to view that!"
				});
				res.redirect('/teachers/dashboard');
			}
		})
	});

	app.post('/account/password', function (req, res) {
		req.assert('password', 'Password must be at least 4 characters long').len(4);
		req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

		var errors = req.validationErrors();

		if (errors) {
			req.flash('errors', errors);
			return res.redirect('/teachers/dashboard');
		}
		User.findById(req.user.id, function (err, user) {
			if (err) {
				return next(err);
			}
			user.password = req.body.password;
			user.save(function (err) {
				if (err) {
					return next(err);
				}
				req.flash('success', {
					msg: 'Password has been changed'
				});
				res.redirect('/teachers/dashboard');
			});
		});
	});
	app.get('/auth/google', passport.authenticate("google", {
		scope: ["profile", "email"]
	}));

	app.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
		res.redirect('/teachers/dashboard');
	});

	app.post('/forgot', function (req, res, next) {
		async.waterfall([
			function (done) {
				crypto.randomBytes(20, function (err, buf) {
					var token = buf.toString('hex');
					done(err, token);
				});
			},
			function (token, done) {
				User.findOne({
					email: req.body.email
				}, function (err, user) {
					if (!user) {
						req.flash('errors', {msg: 'No account with that email address exists.'});
						return res.redirect('/teachers/login');
					}
					if(!user.password && user.googleId){
						req.flash('errors', {msg: 'This account is assoiated with Google, use Google Sign-In'});
						return res.redirect('/teachers/login');
					}

					user.resetPasswordToken = token;
					user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

					user.save(function (err) {
						done(err, token, user);
					});
				});
			},
			function (token, user, done) {
				var options = {
					auth: {
						api_user: keys.sendGrid.username,
						api_key: keys.sendGrid.password
					}
				}
				var client = nodemailer.createTransport(sgTransport(options));

				var email = {
					from: keys.sendGrid.supportEmail,
					to: user.email,
					subject: 'Easy Eval-- Reset your password',
					text: 'Hello,\n\n' +
						'Please click on the following link, or paste this into your browser to reset your password:\n\n' +
						'http://' + req.headers.host + '/reset/' + token + '\n\n' +
						'If you did not request this, just ignore this email and your password will remain unchanged.\n\n' +
						'Thank you for using EasyEval\n\n'+
						"--\n\n"+
						"Eric Udlis\n\n"+
						"EasyEval Support"
				};
				client.sendMail(email, function (err, info) {
					if (err) {
						console.log(err);
					} else {
						console.log('Message sent: ' + info.response);
						req.flash('success', {
							msg: 'Recovery email sent-- if not in inbox, check your spam folder'
						});
						res.redirect('/teachers/login');

					}
				});
			}
		], function (err) {
			if (err) return next(err);
			req.flash('success', {
				msg: 'Recovery Email Sent'
			});
			res.redirect('/teachers/login');
		});
	});

	app.get('/reset/:token', function(req, res) {
		User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
			if (!user) {
				req.flash('error', {msg: 'Password reset token is invalid or has expired.' });
				return res.redirect('/teachers/login');
			}
			res.render('reset', {
				user: req.user,
				layout: 'teacherSide.handlebars',
				title: "EasyEval- Reset Password",
				token: req.params.token
			});
		});
	});


	app.post('/reset', function(req, res) {
		async.waterfall([
			function(done) {
				User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
					if (!user) {
						req.flash('errors', {msg: 'Password reset token is invalid or has expired.'});
						return res.redirect('/teachers/login');
					}

					user.update({
						username: user.username
					}, {
						$push: {
							password: req.body.password,
							resetPasswordToken: undefined,
							resetPasswordExpires: undefined
						}
					},
					function (err) {
						if (err) console.log(err);
					});
	
					user.save(function(err) {
						req.logIn(user, function(err) {
							res.redirect('/teachers/dashboard');
						});
					});
				});
			},
			function(user, done) {
				var smtpTransport = nodemailer.createTransport('SMTP', {
					service: 'SendGrid',
					auth: {
						user: keys.sendGrid.username,
						pass: keys.sendGrid.password
					}
				});
				var mailOptions = {
					to: user.email,
					from: keys.sendGrid.supportEmail,
					subject: 'Your password has been changed',
					text: 'Hello,\n\n' +
						'This is a confirmation that you have changed the password for your account ' + user.username + '.\n' +
						'If you did not do this, please contact support immediately\n\n' +
						'Thank you for using EasyEval\n\n'+
						"--\n"+
						"Eric Udlis\n"+
						"EasyEval Support"
				};
				smtpTransport.sendMail(mailOptions, function(err) {
					req.flash('success', {msg: 'Success! Your password has been changed.'});
					res.redirect('/teachers/login');
					done(err);
				});
			}
		], function(err) {
			res.redirect('/teachers/login');
		});
	});

	app.post('/account/contactSupport', function(req,res){
		var options = {
			auth: {
			  api_user: keys.sendGrid.username,
			  api_key: keys.sendGrid.password
			}
		  }
		  
		  var client = nodemailer.createTransport(sgTransport(options));
		  
		  var email = {
			from: req.body.email,
			to: 'udlis.eric@gmail.com',
			subject: 'EasyEval Support',
			text: "EasyEval User:" + req.user.username + "\n\n" +
				req.body.message,
		  };
		  
		  client.sendMail(email, function(err, info){
			  if (err ){
				console.log(error);
			  }
			  else {
				console.log('Message sent: ' + info.response);
				req.flash('success', {msg: 'Successfully Contacted Support'});
				res.redirect('/teachers/dashboard');
			  }
		  });
	});

	app.get('/forgot', function (req, res) {
		res.redirect('/teachers/login');
	});

	var map = sitemap({
		generate: app,
		url: "easyeval.me"
	  });
	app.get('/sitemap.xml', function(req, res) { // send XML map

		map.XMLtoWeb(res);
	  }).get('/robots.txt', function(req, res) { // send TXT map
	  
		map.TXTtoWeb(res);
	  });

app.get('/landing', function(req,res){
	res.render('landing', {
		layout: 'teacherSide.handlebars',
		title: "EasyEval- Teachers"
	});
});

app.get('/test', function(req,res){
	Project.findOne({connectCode: 37421}, function(err, project){
		var splitStandard = []
		splitStandard = project.standards.split(',');
		res.render('results',
		{
			project: project,
			standards: splitStandard
		});
	})});
	
	app.get('/terms', function(req,res){
		res.render('terms',{
		layout: 'teacherSide.handlebars',
		title: 'EasyEval- Terms and Conditions'
	});})

	app.get('/privacypolicy', function(req,res){
		res.render('privacyPolicy',{
		layout: 'teacherSide.handlebars',
		title: 'EasyEval- Privacy Policy'
	});})

	//Must be last in list
	app.use(function (req, res, next) {
		res.status(404).render('404');
	});
