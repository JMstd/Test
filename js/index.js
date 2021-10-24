var ANNOTATIONDATA = {};
var HOTSPOTSDATA = {};

var myMinMaxTheta = [];
var myMinMaxDist = [];
var typeHs = "Sphere";
var urlHS = "models/sphere.ply";

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function () {
	if (this.readyState == 4 && this.status == 200) {
		var myObj = JSON.parse(this.responseText);
		ANNOTATIONDATA = myObj;
	}
};
xmlhttp.open("GET", "js/test.json", false);
xmlhttp.send();

//*********************************************************************************************************************

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function () {
	if (this.readyState == 4 && this.status == 200) {
		var myObj = JSON.parse(this.responseText);
		HOTSPOTSDATA = myObj;
	}
};
xmlhttp.open("GET", "js/coord_test_RC.json", false);
xmlhttp.send();

//**************************** Start setting datas from json ****************************

// Model data 
myMinMaxTheta.push(ANNOTATIONDATA.minMaxTheta[0], ANNOTATIONDATA.minMaxTheta[1]);
myMinMaxDist.push(ANNOTATIONDATA.minMaxDist[0],  ANNOTATIONDATA.minMaxDist[1]);

// Start hotspots data 
var cont = {};
for (var ii = 0; ii < HOTSPOTSDATA.annotations.length; ii++) {
	var pos = HOTSPOTSDATA.annotations[ii].position
	var radius = HOTSPOTSDATA.annotations[ii].radius;
	var newSpot = {
		mesh: typeHs,
		color: [0.0, 0.25, 1.0],
		transform: {
			matrix:
				SglMat4.mul(SglMat4.translation(pos),
					SglMat4.scaling([radius, radius, radius]))
		},
	};
	cont[HOTSPOTSDATA.annotations[ii].name] = newSpot;
}
// End hotspots data

function actionsToolbar(action) {
	if (action == 'home') presenter.resetTrackball();
	else if (action == 'zoomin') presenter.zoomIn();
	else if (action == 'zoomout') presenter.zoomOut();
	else if (action == 'lighting' || action == 'lighting_off') {
		if (action == 'lighting') {
			lightSwitchL('light_off');
		}
		presenter.enableSceneLighting(!presenter.isSceneLightingEnabled()); lightingSwitch();
	}
	else if (action == 'light' || action == 'light_off') lightSwitchL(action);
	//--COLOR--	
	else if (action == 'color' || action == 'color_on') { presenter.toggleInstanceSolidColor(HOP_ALL, true); colorSwitch(); }
	//--COLOR--	
	else if (action == 'perspective' || action == 'orthographic') { presenter.toggleCameraType(); cameraSwitch(); }
	else if (action == 'hotspot' || action == 'hotspot_on') { presenter.toggleSpotVisibility(HOP_ALL, true); presenter.enableOnHover(!presenter.isOnHoverEnabled()); hotspotSwitch(); }
	else if (action == 'measure' || action == 'measure_on') { presenter.enableMeasurementTool(!presenter.isMeasurementToolEnabled()); measureSwitch(); }
	else if (action == 'screenshot') presenter.saveScreenshot();
	else if (action == 'full_on' || action == 'full') { fullscreenSwitch(); }
	else if (action == 'move_up' || action == 'move_down' || action == 'move_right' || action == 'move_left') step(action);
	else if (action == 'North' || action == 'West' || action == 'Est' || action == 'South' || action == 'Top') 	presenter.animateToTrackballPosition(ANNOTATIONDATA.cardinalP[action]);

}

//**************************** Start manager of arrows movements ****************************
function step(action) {
	var my_pos = [];
	var vstep = 0.1;
	var hstep = 0.1;
	my_pos = presenter.getTrackballPosition();

	switch (action) {
		case 'move_up':
			my_pos[3] -= vstep;
			presenter.animateToTrackballPosition(my_pos);
			break;
		case 'move_down':
			my_pos[3] += vstep;
			presenter.animateToTrackballPosition(my_pos);
			break;
		case 'move_right':
			var gr = Math.PI * my_pos[0] / 180; // from degrees to radians
			my_pos[2] -= 0.1 * Math.cos(gr);
			my_pos[4] += 0.1 * Math.sin(gr);
			presenter.animateToTrackballPosition(my_pos);
			break;
		case 'move_left':
			var gr = Math.PI * my_pos[0] / 180; // from degrees to radians
			my_pos[2] += 0.1 * Math.cos(gr);
			my_pos[4] -= 0.1 * Math.sin(gr);
			presenter.animateToTrackballPosition(my_pos);
			break;

	}
}
//**************************** End manager of arrows movements ****************************
/*
function log(msg) {
	document.getElementById("log-text").innerHTML += msg + "\n";
	document.getElementById("log-text").scrollTop = document.getElementById("log-text").scrollHeight;
}
*/
//-------------------------------------------
function compassClick(event) {
	var dirX = (event.offsetX - (event.srcElement.width / 2.0)) / event.srcElement.width;
	var dirY = (event.offsetY - (event.srcElement.height / 2.0)) / event.srcElement.height;
	var len = Math.sqrt((dirX * dirX) + (dirY * dirY));
	dirX = dirX / len;
	dirY = dirY / len;
	var targetA = sglRadToDeg(Math.atan2(dirX, dirY));
	var currpos = presenter.getTrackballPosition();
	targetA = currpos[0] + targetA;
	targetA = targetA < 0 ? ((targetA % 360) + 360) : (targetA % 360);
	targetA = Math.floor((targetA + 45) / 90.0) * 90.0;
	currpos[0] = targetA
	presenter.animateToTrackballPosition(currpos);
}
//-------------------------------------------
//**************************** Manages the lightcontroller ****************************
function lightSwitchL(status) {

	if (status == 'light') {
		$('#light').css("visibility", "hidden");
		$('#light_off').css("visibility", "visible");
		$('#lighting_off').css("visibility", "hidden");	//manage lighting combined interface
		$('#lighting').css("visibility", "visible");	//manage lighting combined interface

		$('#lightcontroller').css('right', 14 + "%");
		$('#lightcontroller').css('left', "auto");
		$('#lightcontroller').css('top', ($('#right_tolbar').position().top + $('#right_tolbar').width() * 2 + 180));

		presenter.enableSceneLighting('lighting_off');
		lightingSwitch('lighting_off');
	}
	else {
		$('#light_off').css("visibility", "hidden");
		$('#light').css("visibility", "visible");

		$('#lightcontroller').css('top', ($('#toolbar').position().top - 250)); //manages the lightcontroller when it disappears
	}
}

//**************************** Start functions that make lightController work ****************************
function click_lightcontroller(event) {
	var XX = 0, YY = 0;
	var midpoint = [63, 63];
	var radius = 60;

	var lightControllerCanvas = document.getElementById("lightcontroller_canvas");
	var coords = lightControllerCanvas.relMouseCoords(event);

	XX = coords.x - midpoint[0];
	YY = coords.y - midpoint[1];

	// check inside circle
	if ((XX * XX + YY * YY) < ((radius - 5) * (radius - 5))) {
		var lx = (XX / radius) / 2.0;
		var ly = (YY / radius) / 2.0;

		presenter.rotateLight(lx, -1.0 * ly); 		// inverted ly
		update_lightcontroller(lx, ly);

		(event.touches) ? lightControllerCanvas.addEventListener("touchmove", drag_lightcontroller, false) : lightControllerCanvas.addEventListener("mousemove", drag_lightcontroller, false);
	}
}

function drag_lightcontroller(event) {
	var XX = 0, YY = 0;
	var midpoint = [63, 63];
	var radius = 60;

	var lightControllerCanvas = document.getElementById("lightcontroller_canvas");
	var coords = lightControllerCanvas.relMouseCoords(event);

	XX = coords.x - midpoint[0];
	YY = coords.y - midpoint[1];

	// check inside circle
	if ((XX * XX + YY * YY) < ((radius - 5) * (radius - 5))) {
		var lx = (XX / radius) / 2.0;
		var ly = (YY / radius) / 2.0;

		presenter.rotateLight(lx, -1.0 * ly); 		// inverted ly 
		update_lightcontroller(lx, ly);
	}
}

function update_lightcontroller(xx, yy) {

	var midpoint = [63, 63];
	var radius = 60;

	var lightControllerCanvas = document.getElementById("lightcontroller_canvas");
	var context = lightControllerCanvas.getContext("2d");
	context.clearRect(0, 0, lightControllerCanvas.width, lightControllerCanvas.height);

	context.beginPath();
	context.arc(midpoint[0], midpoint[1], radius, 0, 2 * Math.PI, false);
	var grd = context.createRadialGradient(midpoint[0] + (xx * radius * 2), midpoint[1] + (yy * radius * 2), 5, midpoint[0], midpoint[1], radius);
	grd.addColorStop(0, "#f8f8f8");
	grd.addColorStop(1, "black");
	context.fillStyle = grd;
	context.fill();
	context.lineWidth = 3;
	context.strokeStyle = 'black';
	context.stroke();

	context.beginPath();
	context.rect(midpoint[0] + (xx * radius * 2) - 3, midpoint[1] + (yy * radius * 2) - 3, 5, 5);
	context.lineWidth = 2;
	context.strokeStyle = 'yellow';
	context.stroke();

	//presenter.ui.postDrawEvent(); 
}

function relMouseCoords(event) {
	var totalOffsetX = 0;
	var totalOffsetY = 0;
	var canvasX = 0;
	var canvasY = 0;
	var pageX = 0;
	var pageY = 0;
	var currentElement = this;

	do {
		totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
		totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
	}
	while (currentElement = currentElement.offsetParent)

	(event.touches) ? (pageX = event.touches[0].pageX) : (pageX = event.pageX);
	(event.touches) ? (pageY = event.touches[0].pageY) : (pageY = event.pageY);

	canvasX = pageX - totalOffsetX;
	canvasY = pageY - totalOffsetY;

	return { x: canvasX, y: canvasY }
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

//**************************** End lightControler functions ****************************

//****************************** Start ConvertToGlobal/Local coordinates taken from SPOTMAKER. ******************************
//****************************** Transform coordinates from global to local and viceversa. ******************************

function convertToGlobal(state) {

	var newstate = [];
	// angles
	newstate[0] = state[0];
	newstate[1] = state[1];
	// pan
	newstate[2] = (state[2] / presenter.sceneRadiusInv) + presenter.sceneCenter[0];
	newstate[3] = (state[3] / presenter.sceneRadiusInv) + presenter.sceneCenter[1];
	newstate[4] = (state[4] / presenter.sceneRadiusInv) + presenter.sceneCenter[2];
	// distance
	newstate[5] = state[5] / presenter.sceneRadiusInv;
	return newstate;
}
function convertToLocal(state) {

	var newstate = [];
	// angles
	newstate[0] = state[0];
	newstate[1] = state[1];
	// pan

	newstate[2] = (state[2] - presenter.sceneCenter[0]) * presenter.sceneRadiusInv;
	newstate[3] = (state[3] - presenter.sceneCenter[1]) * presenter.sceneRadiusInv;
	newstate[4] = (state[4] - presenter.sceneCenter[2]) * presenter.sceneRadiusInv;
	// distance

	// (state[5] * presenter.sceneRadiusInv) --> coordinate from SPOTMAKER // start --> my startDistance // 2 --> SPOTMAKER start distance
	newstate[5] = (state[5] * presenter.sceneRadiusInv) * ANNOTATIONDATA.start / 2;

	return newstate;
}
//****************************** End ConvertToGlobal/Local ******************************

//****************************** Original version of the funcion **********************************************
function convertToLocal_or(state) {

	var newstate = [];
	// angles
	newstate[0] = state[0];
	newstate[1] = state[1];
	// pan

	newstate[2] = (state[2] - presenter.sceneCenter[0]) * presenter.sceneRadiusInv;
	newstate[3] = (state[3] - presenter.sceneCenter[1]) * presenter.sceneRadiusInv;
	newstate[4] = (state[4] - presenter.sceneCenter[2]) * presenter.sceneRadiusInv;
	// distance
	newstate[5] = state[5] * presenter.sceneRadiusInv;
	return newstate;
}
//**************************************************************************************************************

//*********************************** Start hotspots f() ***********************************
function onPickedSpot(id) {
	for (var ii = 0; ii < HOTSPOTSDATA.annotations.length; ii++) {
		var view = HOTSPOTSDATA.annotations[ii].view;
		if (HOTSPOTSDATA.annotations[ii].name == id) {
			presenter.animateToTrackballPosition(convertToLocal(view));
		}
	}
}
//*********************************** End hotspots f() ***********************************

function onEndMeasure(measure) {
	// measure.toFixed(2) sets the number of decimals when displaying the measure
	// depending on the model measure units, use "mm","m","km" or whatever you have
	$('#measure-output').html(measure.toFixed(2) + " mm");
}

var presenter = null;

function setup3dhop() {
	presenter = new Presenter("draw-canvas");

	var myScene;
	myscene = {
		meshes: {},
		modelInstances: {},
		spots: {},
		trackball: {},
		space: {}
	};

	//*********************************** Start passage of data for settings ***********************************
	myscene.meshes[ANNOTATIONDATA.name] = { url: ANNOTATIONDATA.url };
	myscene.meshes[typeHs] = { url: urlHS };    // Here I declare the sphere
	myscene.modelInstances[ANNOTATIONDATA.mdI] = {
		mesh: ANNOTATIONDATA.name,
		color: [0.6, 0.5, 0.55]
	};
	myscene.spots = cont;
	myscene.trackball = { type: TurntablePanTrackball };
	myscene.trackball.trackOptions = {
		startPhi: 0.0,
		startTheta: 0.0,
		startDistance: ANNOTATIONDATA.start,
		minMaxPhi: [-180, 180],
		minMaxTheta: myMinMaxTheta,   // [-80.0,80.0] // Theta adjusts how much I can turn (low - high) the model about a central axis 
		minMaxDist: myMinMaxDist,    //  [2.5,3.0]
		startPanX: ANNOTATIONDATA.PanX,
		startPanY: 0.0,
		startPanZ: 0.0,
		minMaxPanX: [-0.5, 0.5],
		minMaxPanY: [-0.6, 0.6],
		minMaxPanZ: [-0.3, 0.3]
	};
	myscene.space = {
		centerMode: "scene",
		radiusMode: "scene",
		cameraFOV: 60.0,
		cameraNearFar: [0.01, 10.0],
		cameraType: "perspective",
		sceneLighting: true
	};
	//*********************************** End passage of data for settings ***********************************

	// Assign myscene values to presenter
	presenter.setScene(myscene);

	/* Start hotspots (the rest of the added code is spots above) */
	presenter.setSpotVisibility(HOP_ALL, false, true);

	presenter._onPickedSpot = onPickedSpot;
	/* End hotspots */

	presenter._onEndMeasurement = onEndMeasure;
}

//**************************** Start COMPASS ****************************
function onTrackballUpdate(trackState) {
	updateCompass(sglDegToRad(trackState[0]), sglDegToRad(trackState[1]));
}
function updateCompass(angle, tilt) {
	$('#compassCanvas').attr('width', 100);
	$('#compassCanvas').attr('height', 100);
	$('#compassCanvas').css('border-radius', 50);
	var canv = document.getElementById("compassCanvas");
	var ctx = canv.getContext("2d");
	var hh = canv.height;
	var ww = canv.width;

	ctx.clearRect(0, 0, canv.width, canv.height);
	// Save the current drawing state
	ctx.save();

	// Now move across and down half the
	ctx.translate(ww / 2.0, hh / 2.0);

	// Rotate around this point
	ctx.rotate(angle);

	ctx.beginPath();
	ctx.lineWidth = 1;   // Change the thickness of the cardinal points
	//	ctx.arc(0, 0, 45, 0, 2 * Math.PI, false);  // With the commented part underneath, create an inner circumference
	//	ctx.strokeStyle = '#443377';
	//	ctx.stroke();

	ctx.font = "28px Verdana";
	ctx.strokeStyle = '#ff4444';
	ctx.strokeText("N", -10, -25);
	ctx.strokeStyle = '#ffffff';
	ctx.strokeText("S", -10, 45);
	ctx.strokeText("E", 27, 10);
	ctx.strokeText("W", -47, 10);

	// Restore the previous drawing state
	ctx.restore();
}
//**************************** End COMPASS ****************************

//*********************************************************************************************************************
$(document).ready(function () {

	// **************************** Start lightController ***********************************
	var lightControllerCanvas = document.getElementById("lightcontroller_canvas");
	lightControllerCanvas.addEventListener("touchstart", click_lightcontroller, false);
	lightControllerCanvas.addEventListener("mousedown", click_lightcontroller, false);

	var canvas = document.getElementById("draw-canvas");
	canvas.addEventListener("mouseup", function () {
		lightControllerCanvas.removeEventListener("mousemove", drag_lightcontroller, false);
		lightControllerCanvas.removeEventListener("touchmove", drag_lightcontroller, false);
	}, false);
	document.addEventListener("mouseup", function () {
		lightControllerCanvas.removeEventListener("mousemove", drag_lightcontroller, false);
		lightControllerCanvas.removeEventListener("touchmove", drag_lightcontroller, false);
	}, false);

	//-----------------------------------
	update_lightcontroller(-0.17, -0.17);
	// **************************** End lightController ***********************************

	init3dhop();
	setup3dhop();

});
// onload occurs when all content has been loaded
//window.onload = setup3dhop;
