var xl = require('excel4node');
var Project = require('./models/project');
var User = require('./models/user');
var groupMemberArray = [];

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
        if (err){
            throw err;

        } 
            var wb = new xl.Workbook();
            var standards = project.standards.split(',');
            var numStandards = project.standardsInAssignment;

            // Add Worksheets to the workbook
            var ws = wb.addWorksheet('EasyEval Results');
            ws.row(1).freeze();
            // Create a reusable style
            var style = wb.createStyle({
                font: {
                    color: '#000000',
                    size: 12
                },
             })
             var  header = wb.createStyle({
                font: {
                    color: '#000000',
                    size: 14,
                    bold: true,
                },
                alignment:{
                    horizontal: 'center',
                    shrinkToFit: true
                }
            });
         


            ws.cell(1,3).string("Group Number").style(header);
            ws.cell(1,2).string("Name").style(header);
            for (var i = 1; i <= project.standardsInAssignment; i++) {
                ws.cell(1, i + 3).string(String(standards[i - 1])).style(header);
            }
            for (var i = 0; i <= project.submissions.length; i++) {
                
                if (project.submissions[i]) {
                    groupMemberArray[i] = project.submissions[i].groupMembers.split(',');
                    if(groupMemberArray[i][groupMemberArray[i].length -1] === ''){
                        groupMemberArray[i].pop();
                    }
                    if(i != 0){
                        var   oldGroupMemberArrayLength = groupMemberArray[i-1].length || 0;
                       }
                       if(i == 0){
                           math = 2;
                       }if(i == 1){
                           math = ((i* oldGroupMemberArrayLength) + i )+ 2;
                       }if(i > 1){
                           oldMath = math;
                           math = oldMath +oldGroupMemberArrayLength +1

                       }
                    for (var z = 0; z < groupMemberArray[i].length; z++) {
                        if (z == 0) {

                            ws.cell(math, 1).string("Submitted By:").style(style);
                        }
                        ws.cell(math+z, 2).string(String(groupMemberArray[i][z])).style(style);
                        ws.cell(math+z, 3).number(Number(project.submissions[i].groupNumber)).style(style);
                        for (var y = 0; y < project.standardsInAssignment; y++) {
                            ws.cell(math+z, y + 4).number(Number(project.submissions[i][buildSliderName(y, z)])).style(style);
                        }

                    }

                }
            }
            console.log("Writing File");
            wb.write(buildFileName(project.projectTitle));
    });

}