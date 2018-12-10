const { mongo } = require('mongoose');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/EasyEval', {useNewUrlParser: true});
var db = mongoose.connection;

//User Scheme
var projectSchema = mongoose.Schema({
    projectTitle: {
       type: String
    },
    standardsInAssignment: {
        type: Number
    },
    standards: {
        type: String
    },
    maxScore: {
        type: Number
    },
    creator: {
        type: String
    },
    connectCode:{
        type: Number,
        uniquie: true
    },
    submissions:[],
    
    isPointWeight:{
        type: Boolean
    },
    dateCreated:{
        type: Date
    }
});


var Project = module.exports = mongoose.model('Project', projectSchema);
