const { mongo } = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
const saltRounds = 10;
var LocalStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/EasyEval');
var db = mongoose.connection;

//User Scheme
var userSchema = mongoose.Schema({
    username: {
       type: String,
       index: true
    },
    password: {
        type: String
    },
    email: {
        type: String,
        unique: false
    },
    firstName: {
        type: String
    },
    lastName:{
        type: String
    },
    googleId:{
        type: String
    }
});
userSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) {
      return next();
    }
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  });
  


module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){
    var query = {username: username};
    User.findOne(query, callback);
}

userSchema.methods.comparePassword = function(canditatePassword, callback){
    bcrypt.compare(canditatePassword, this.password, function(err, isMatch) {
        callback(null, isMatch);
    });
}
var User = mongoose.model('User', userSchema);
module.exports = User;
