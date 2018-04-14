const { mongo } = require('mongoose');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/EasyEval');
var db = mongoose.connection;

//Submission Scheme
var submissionSchema = mongoose.Schema({
    data:{
        type: [String]
    },
    submitter:{
        type: String
    },
    id:{
        type: Number
    },
    groupMembers:{
        type: String
    }
});

var Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;