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
var chartWidth;
var maxScore;
var addButton = [];
var firstName;
var hasInit = false;
var inputBox = [];
var boxesCreated = 0;
var inputLabel = [];
var pwSliderLabel = [];
var pointWeightSliders = [];
var pointWeightData;
var pointWeightChart;
var totalPoints = 0;
var totalInputBox;
var addingArray = [];
var pointWeightHeader;
var weightTotal = numInGroup * 100;

google.charts.load('current', {
	'packages': ['corechart']
});




function init() {
	document.getElementById("evalPage").style.height = String(screen.height) + "px";
	if (isPointWeight) {
		chartWidth = (document.documentElement.clientWidth / (standardsInAssignment + 1) - 10);
	} else {
		chartWidth = (document.documentElement.clientWidth / (standardsInAssignment) - 10);
	}
	defineLocations();
	drawChart();
	defineSliders();
	//createButton();
	hasInit = true;
	if (isPointWeight) {
		createPointWeight();
		updatePointWeightSliders();
	}
	for (var i = 0; i < standardsInAssignment; i++) {
		updateSliders(i);
	}

}

function createButton() {
	var button = document.createElement('button');
	button.setAttribute("onClick", "sendData()");
	button.setAttribute("class", "btn btn-lg btn-block btn-primary");
	button.style.margin = "auto center";
	button.style.display = "block";
	button.setAttribute("name", "id");
	button.setAttribute("type", "submit");
	button.setAttribute("value", code);
	button.innerHTML = "Submit to Teacher"
	document.getElementById("form").appendChild(button);
}

function drawSliders(chartNumber) {
	for (var i = 0; i < numInGroup; i++) {

		var temp = (chartNumber * 100) + i;

		sliderDiv[temp] = document.createElement("div");
		sliderDiv[temp].setAttribute('class', 'slidecontainer');

		document.getElementById("chart" + chartNumber.toString() + "Sliders").appendChild(sliderDiv[temp]);
		slider[temp] = document.createElement("input");
		slider[temp].setAttribute("type", "range");
		slider[temp].setAttribute("min", '0');
		slider[temp].setAttribute("max", maxScore);
		slider[temp].setAttribute("value", "0");
		slider[temp].setAttribute("class", "slider");
		slider[temp].setAttribute("id", (chartNumber) + "slider" + i.toString());
		slider[temp].setAttribute("name", (chartNumber) + "slider" + i.toString());
		slider[temp].setAttribute('onInput', "updateSliders(" + chartNumber + ")");
		sliderDiv[temp].appendChild(slider[temp]);

		sliderLabel[temp] = document.createElement("h4");
		sliderLabel[temp].setAttribute("id", chartNumber.toString() + "slider" + i.toString() + "Value");
		sliderLabel[temp].innerHTML = 'Loading...';
		sliderDiv[temp].appendChild(sliderLabel[temp]);
		sliderOutputs[temp] = slider[temp].value;





	}
}

function defineSliders() {
	for (var i = 0; i < standardsInAssignment; i++) {
		sliderGroup[i] = document.createElement("div");
		sliderGroup[i].setAttribute("id", "chart" + i.toString() + "Sliders");
		sliderGroup[i].setAttribute("class", 'col-md-1');
		defineSliderLocation(i);
		document.getElementById("sliders").appendChild(sliderGroup[i]);
		drawSliders(i);
	}
}

function defineSliderLocation(i) {
	sliderGroup[i].style.position = "absolute";
	sliderGroup[i].style.left = (chartWidth / 4) + (i * chartWidth) + "px";
	sliderGroup[i].style.width = chartWidth;
}

function defineLocations() {
	for (var i = 0; i < standardsInAssignment; i++) {
		chartDiv[i] = document.createElement("div");
		chartDiv[i].setAttribute("id", "chart" + i.toString());
		document.getElementById("charts").appendChild(chartDiv[i]);
	}
}

function drawData(chartNumber) {
	data[chartNumber] = new google.visualization.DataTable();

	data[chartNumber].addColumn('string', "Group Memeber Name");
	data[chartNumber].addColumn('number', "Score");

	data[chartNumber].addRows(numInGroup);

	for (var x = 0; x < numInGroup; x++) {
		var temp = (chartNumber * 100) + x;
		data[chartNumber].setCell(x, 0, groupMemberNames[x]);
		data[chartNumber].setCell(x, 1, sliderOutputs[temp]);

	}
}

function drawChart() {
	for (var i = 0; i < standardsInAssignment; i++) {
		drawData(i);
		options[i] = {
			title: chartTitle[i],
			width: chartWidth,
			height: '500',
			titleTextStyle: {
				color: "black",
				fontSize: 24,
				bold: true
			}
		};


		chartLocation = "chart" + i.toString();
		chart[i] = new google.visualization.PieChart(document.getElementById(chartLocation));

		chart[i].draw(data[i], options[i]);

	}


}


function updateSliders(chartNumber) {


	for (var z = 0; z < numInGroup; z++) {

		var temp = (100 * chartNumber) + z;

		if (slider[temp].value !== null) {
			sliderOutputs[temp] = slider[temp].value;

			var labelText = groupMemberNames[z] + ": " + slider[temp].value.toString();

			sliderLabel[temp].innerHTML = labelText;
		}
	}
	drawChart();
}

function createPointWeight() {
	var pointWeightName = [];
	
	var sliderMax = 100+ (numInGroup*10);
	var pwSliderDiv = [];
	var sliderMin = 100 - (numInGroup*10);
	
	totalInputBox = document.createElement("input");
	totalInputBox.setAttribute("type", "number");
	totalInputBox.style.display = "none";
	totalInputBox.setAttribute("name", "totalWeights");
	totalInputBox.setAttribute("value", weightTotal);
	totalInputBox.setAttribute("max", weightTotal);
	totalInputBox.setAttribute("min", weightTotal);
	document.getElementById("submitForm").appendChild(totalInputBox);
	
	if (isPointWeight) {

		var pointWeightChartDiv = document.createElement("div");
		document.getElementById("charts").appendChild(pointWeightChartDiv);

		pointWeightDiv = document.createElement("div");
		pointWeightDiv.setAttribute("id", "pointWeightDiv");
		pointWeightDiv.setAttribute("class", 'col-md-1');
		pointWeightDiv.style.position = "absolute";
		pointWeightDiv.style.left = (chartWidth / 4) + (chart.length * chartWidth) + "px";
		pointWeightDiv.style.width = chartWidth;

		pointWeightHeader = document.createElement("h3");
		pointWeightHeader.innerHTML ="Total: " + totalPoints;
		pointWeightDiv.appendChild(pointWeightHeader);
		
		
		document.getElementById("sliders").appendChild(pointWeightDiv);

		
		var pointWeightDiv;

		for (var i = 0; i < numInGroup; i++) {

			pwSliderDiv[i] = document.createElement("div");
			pwSliderDiv[i].setAttribute('class', 'slidecontainer');
			pointWeightDiv.appendChild(pwSliderDiv[i]);

			pointWeightSliders[i] = document.createElement("input");
			pointWeightSliders[i].setAttribute("type", "range");
			pointWeightSliders[i].setAttribute("min", "80");
			pointWeightSliders[i].setAttribute("max", "120");
			pointWeightSliders[i].setAttribute("value", "100");
			pointWeightSliders[i].setAttribute("class", "slider");
			pointWeightSliders[i].setAttribute("id", "pointWeightSlider" + i);
			pointWeightSliders[i].setAttribute("name", "pointWeightSlider" + i);
			pointWeightSliders[i].setAttribute('onInput', "updatePointWeightSliders()");
			pwSliderDiv[i].appendChild(pointWeightSliders[i]);

			pwSliderLabel[i] = document.createElement("h4");
			pwSliderLabel[i].setAttribute("id", "PointWidth" + i);
			pwSliderLabel[i].innerHTML = 'Loading...';
			pwSliderDiv[i].appendChild(pwSliderLabel[i]);

		}
		

		pointWeightData = new google.visualization.DataTable();

		pointWeightData.addColumn('string', "Group Memeber Name");
		pointWeightData.addColumn('number', "Score");

		pointWeightData.addRows(numInGroup);

		for (var i = 0; i < numInGroup; i++) {
			pointWeightData.setCell(i, 0, groupMemberNames[i]);
			pointWeightData.setCell(i, 1, pointWeightSliders[i].value);

		}
		var pointWeightOptions = {

			title: "Score Weight",
			width: chartWidth,
			height: '500',
			titleTextStyle: {
				color: "black",
				fontSize: 24,
				bold: true
			}
		};
		pointWeightChart = new google.visualization.PieChart(pointWeightChartDiv);
		pointWeightChart.draw(pointWeightData, pointWeightOptions);
	}
}

function updatePointWeightSliders() {
	for (var i = 0; i < numInGroup; i++) {
		pwSliderLabel[i].innerHTML = groupMemberNames[i] + ": " + pointWeightSliders[i].value;
		pointWeightData.setCell(i, 0, groupMemberNames[i]);
		pointWeightData.setCell(i, 1, pointWeightSliders[i].value);

	}
	var pointWeightOptions = {

		title: "Score Weight",
		width: chartWidth,
		height: '500',
		titleTextStyle: {
			color: "black",
			fontSize: 24,
			bold: true
		}
	};
	pointWeightChart.draw(pointWeightData, pointWeightOptions);
	updateTotal();
}

function updateTotal(){
	for(var i=0; i<pointWeightSliders.length; i++){
	addingArray[i] = Number(pointWeightSliders[i].value);
	}

	totalPoints = addingArray.reduce(add, 0);

	totalInputBox.setAttribute("value", totalPoints);
	pointWeightHeader.innerHTML ="Total: " + totalPoints;
	if(totalPoints == weightTotal){
		pointWeightHeader.style.color = "green";
	}else{
		pointWeightHeader.style.color = "red";
	}
}

function checkPointValue(){
	
}

function add(a, b) {
    return a + b;
}