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
var flash = require('connect-flash');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;

var express = require('express'),
    exphbs  = require('express3-handlebars'),
	app = express();
	app.engine('handlebars', exphbs({defaultLayout: 'main'}));
	app.set('view engine', 'handlebars');

	app.use(express.static('public'));
	app.use(bodyParser.urlencoded({extended : true}));
	app.use(bodyParser.json());
	// app.use(function (req, res, next) {
	// 	res.status(404).render('404');
	//   })

var teachers = require('./routes/teachers');

app.use('/teachers', teachers);


//Sessions
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

//Passport Auth
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

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
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
	console.log(req.body);
	res.render('evaluate', {
		firstName: firstName,
		numInGroup: numInGroup,
		groupMemberNames: groupMemberNames

	});
});


