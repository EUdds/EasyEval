const { mongo } = require('mongoose');
var bcrypt = require('bcryptjs');
const saltRounds = 10;

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/EasyEval');
var db = mongoose.connection;

//User Scheme
var UserSchema = mongoose.Schema({
    username: {
       type: String,
       index: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });


}