const { mongo } = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
const saltRounds = 10;
var LocalStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/EasyEval', {useNewUrlParser: true});
var db = mongoose.connection;

//User Scheme
var userSchema = mongoose.Schema({
    username: {
       type: String,
       index: true,
       unique: true
    },
    password: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    firstName: {
        type: String
    },
    lastName:{
        type: String
    },
    googleId:{
        type: String
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
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
