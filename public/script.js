'use strict';

var chartTitle;
var data = [];
var numInGroup;
var standardsInAssignment;
var sliderOutputs = [];
var sliderLabel = [];
var slider = [];
var sliderDiv = [];
var options = [];
var chart = [];
var chartLocation;
var chartDiv = [];
var sliderGroup = [];
var chartWidth = (document.documentElement.clientWidth/standardsInAssignment - 10);
var maxScore;
var addButton = [];
var firstName;
var hasInit = false;
var inputBox = [];
var boxesCreated = 0;
var inputLabel= [];

google.charts.load('current', {
	'packages': ['corechart']
});




function init(){
	defineLocations();
	console.log("defined Location");
	drawChart();
	console.log("Drew Charts");
	defineSliders();
	console.log("Defined Sliders");
	hasInit = true;
	for(var i=0; i<standardsInAssignment; i++){
		updateSliders(i);
	}
	
	console.log("Updated Sliders");

}
function drawSliders(chartNumber){
	for(var i=0; i< numInGroup; i++){
	
		var temp = (chartNumber*100) + i;
	
		sliderDiv[temp] = document.createElement("div");
		sliderDiv[temp].setAttribute('class', 'slidecontainer');
	
		document.getElementById("chart" + chartNumber.toString() +"Sliders").appendChild(sliderDiv[temp]);
		slider[temp] = document.createElement("input");
		slider[temp].setAttribute("type", "range");
		slider[temp].setAttribute("min", '0');
		slider[temp].setAttribute("max", maxScore);
		slider[temp].setAttribute("value", "0");
		slider[temp].setAttribute("class", "slider");
		slider[temp].setAttribute("id",  (chartNumber) + "slider"+i.toString());
		slider[temp].setAttribute("name",  (chartNumber) + "slider"+i.toString());
		slider[temp].setAttribute('onInput', "updateSliders("+chartNumber+")");
		sliderDiv[temp].appendChild(slider[temp]);
	
		sliderLabel[temp] = document.createElement("h4");
		sliderLabel[temp].setAttribute("id", chartNumber.toString() + "slider" + i.toString() + "Value");
		sliderLabel[temp].innerHTML = 'Loading...';
		sliderDiv[temp].appendChild(sliderLabel[temp]);
		sliderOutputs[temp] = slider[temp].value;
	
	
	
	}
	}
function defineSliders(){
	for(var i=0; i<standardsInAssignment; i++){
		sliderGroup[i] = document.createElement("div");
		sliderGroup[i].setAttribute("id", "chart" + i.toString() +"Sliders");
		sliderGroup[i].setAttribute("class", 'col-md-1');
		defineSliderLocation(i);
		document.getElementById("sliders").appendChild(sliderGroup[i]);
		drawSliders(i);
	}
}

function defineSliderLocation(i){
	sliderGroup[i].style.position = "absolute";
	sliderGroup[i].style.left = (chartWidth/4) + (i*chartWidth)+"px";
	sliderGroup[i].style.width = chartWidth;
}

function defineLocations(){
	for(var i=0; i<standardsInAssignment; i++){
		chartDiv[i] = document.createElement("div");
		chartDiv[i].setAttribute("id", "chart"+i.toString());
		document.getElementById("charts").appendChild(chartDiv[i]);
	}
}

function drawData(chartNumber){
		data[chartNumber] = new google.visualization.DataTable();

		data[chartNumber].addColumn('string', "Group Memeber Name");
		data[chartNumber].addColumn('number', "Score");

		data[chartNumber].addRows(numInGroup);

		for(var x=0; x<numInGroup; x++){
			var temp = (chartNumber*100) + x;
		data[chartNumber].setCell(x, 0, groupMemberNames[x]);
		data[chartNumber].setCell(x, 1, sliderOutputs[temp]);

	}
}

function drawChart() {
		for(var i=0;i<standardsInAssignment;i++){
			drawData(i);
		options[i] = {
			title: chartTitle[i],
			width: chartWidth,
			height: '500',
			titleTextStyle: {color: "black", fontSize: 24, bold: true}
		};


	chartLocation = "chart" + i.toString();
	chart[i] = new google.visualization.PieChart(document.getElementById(chartLocation));

	chart[i].draw(data[i], options[i]);

	}


}


function updateSliders(chartNumber){


	for(var z=0; z<numInGroup; z++){

		var temp = (100*chartNumber) + z;

			if(slider[temp].value !== null){
		sliderOutputs[temp] = slider[temp].value;

		var labelText = groupMemberNames[z] + ": " + slider[temp].value.toString();

		sliderLabel[temp].innerHTML = labelText;
	}
		}
	drawChart();
}

