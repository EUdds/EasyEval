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
var express = require('express'),
    exphbs  = require('express3-handlebars'),
	app = express();
	app.engine('handlebars', exphbs({defaultLayout: 'main'}));
	app.set('view engine', 'handlebars');

	app.use(express.static('public'));
	app.use(bodyParser.urlencoded({extended : true}));
	app.use(bodyParser.json());



	


var checkMimeType = true;

console.log("Starting web server at " + serverUrl + ":" + port);

app.listen(port);

app.get('/', function(req,res){
	res.render('startGroup');
});


app.get('/evaluate', function(req, res) {
	res.render('startGroup');
});

app.get('/startGroup', function(req, res) {
	res.render('startGroup');
	req.firstName = firstName;
	req.numInGroup  = numInGroup;
	req.groupMember0 = groupMemberNames;
	
	
});

app.post('/startGroup', function(req, res){
	firstName = req.body.firstName;
	numInGroup = req.body.numInGroup;
	groupMemberNames = req.body.groupMember0;
	console.log(req.body);
	res.render('evaluate', {
		firstName: req.body.firstName,
		numInGroup: req.body.numInGroup,
		groupMemberNames: req.body.groupMemberNames
		
	});

})
