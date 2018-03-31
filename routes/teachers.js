const { validationResult } = require('express-validator/check');

var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var router = express.Router();
var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
router.use(expressValidator());

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
    var errors = req.validationErrors;
    

    if(errors){
        res.render('register',{
            errors: errors,
            layout: 'teacherSide.handlebars'
        })
    }else{
        console.log("Success!")
    }
});

router.get('/login', function(req,res){
	res.render('login',{
        layout: 'teacherSide.handlebars',
        title: 'EasyEval- Login'
    });
});

module.exports = router;