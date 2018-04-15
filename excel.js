var xl = require('excel4node');
var Project = require('./models/project');
var User = require('./models/user');

// Create a new instance of a Workbook class
module.exports.createWorkbook = function () {


    var wb = new xl.Workbook();

    // Add Worksheets to the workbook
    var ws = wb.addWorksheet('Sheet 1');
    var ws2 = wb.addWorksheet('Sheet 2');

    // Create a reusable style
    var style = wb.createStyle({
        font: {
            color: '#FF0800',
            size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -'
    });

    // Set value of cell A1 to 100 as a number type styled with paramaters of style
    ws.cell(1, 1).number(100).style(style);

    // Set value of cell B1 to 300 as a number type styled with paramaters of style
    ws.cell(1, 2).number(200).style(style);

    // Set value of cell C1 to a formula styled with paramaters of style
    ws.cell(1, 3).formula('A1 + B1').style(style);

    // Set value of cell A2 to 'string' styled with paramaters of style
    ws.cell(2, 1).string('string').style(style);

    // Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
    ws.cell(3, 1).bool(true).style(style).style({
        font: {
            size: 14
        }
    });

    wb.write('Excel.xlsx');
}

function buildSliderName(standard,member){
    return String(standard + "slider" + member);
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
            var ws = wb.addWorksheet('Sheet 1');
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
                        for(var y=0; y<numStandards; y++){
                            ws.cell(math, y+3).number(parseInt(projectData[i][buildSliderName(y,z)])).style(style);
                        }
                        
                    }

                }
            }

            console.log("Writing File");
            wb.write('Results.xlsx');
        });
    });

}