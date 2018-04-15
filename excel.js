var xl = require('excel4node');
var Project = require('./models/project');
var User = require('./models/user');

function buildSliderName(standard, member) {
    return String(standard + "slider" + member);
}

function buildFileName(title) {
    var d = new Date();
    return String(title + "_" + (d.getMonth() + 1) + d.getDate() + '.xlsx');
}
module.exports.exportResults = function (id) {
    Project.findOne({
        connectCode: id
    }, function (err, project) {
        if (err) {
            console.log(err);
        }
        User.findOne({
            username: project.creator
        }, function (err, user) {
            var projectData = [];
            for (var i = 0; i < user.submissions.length; i++) {
                if (user.submissions[i].id == project.connectCode) {
                    projectData[i] = user.submissions[i];
                }
            }
            var wb = new xl.Workbook();
            var standards = project.standards.split(',');
            var numStandards = project.standardsInAssignment;

            // Add Worksheets to the workbook
            var ws = wb.addWorksheet('EasyEval Results');
            // Create a reusable style
            var style = wb.createStyle({
                font: {
                    color: '#000000',
                    size: 12
                },
            });

            for (var i = 1; i <= project.standardsInAssignment; i++) {
                ws.cell(1, i + 2).string(String(standards[i - 1])).style(style);
            }
            for (var i = 0; i <= projectData.length; i++) {
                var groupMemberArray = [];
                if (projectData[i]) {
                    groupMemberArray[i] = projectData[i].groupMembers.split(',');
                    for (var z = 0; z < groupMemberArray[i].length; z++) {

                        math = (i * groupMemberArray[i].length) + z + 2;
                        if (z == 0) {

                            ws.cell(math, 1).string("Submitted By:").style(style);
                        }
                        ws.cell(math, 2).string(String(groupMemberArray[i][z])).style(style);
                        var slider = buildSliderName(0, z);
                        for (var y = 0; y < numStandards; y++) {
                            ws.cell(math, y + 3).number(Number(projectData[i][buildSliderName(y, z)])).style(style);
                        }

                    }

                }
            }
            console.log("Writing File");
            wb.write(buildFileName(project.projectTitle));
        });
    });

}