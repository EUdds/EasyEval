var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var router = express.Router();
var flash = require('connect-flash');

var app = express();
var User = require('../models/user');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(flash());
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

module.exports = router;