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

var Project = module.exports = mongoose.model('Project', UserSchema);

module.exports.getProjectbyId = function(id, callback){
    Project.findById(id, callback);
}


module.exports.createProject = function(newUser, callback){
            newUser.save(callback);
}