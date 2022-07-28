/// <reference path="typings/globals/jquery/index.d.ts" />

//© Copyright 2022 · IMACS - Institute for Mathematics & Computer Science

var rows = [];
const addtemplate = [+1, +1, -1, -1, -1, +2, +2, -2, -2, +3, -3, -4, +4, -5, +5];
const mediumdivstemplate = [4, 5, 6, 4, 5, 6, 4, 5, 6, 5];
const largedivstemplate = [7, 8, 9, 10, 7, 8, 9, 10, 8, 9];
const numrows = 21; //must be odd
const numcols = 15; //prefer odd
var myrowindex, mycolindex;
var currentnumber = 5040;
var score = 11;
let $container, $score;
var lastmove = "";

$(document).ready(function () {
	$container = $("div.container");
	$score = $("div.infoval.number");
	// let width = $container.width();
	// let height = (width * numrows) / numcols;
	// $container.height(height);
	$container.css("grid-template-rows", "repeat(" + numrows + ", 1fr)").css("grid-template-columns", "repeat(" + numcols + ", 1fr)");
	startGame();
	$("button.newgame").click(startGame);
	document.addEventListener("keydown", (e) => {
		e.preventDefault();
		if (!e.repeat) {
			if (e.key == "ArrowRight") registerMove("right");
			else if (e.key == "ArrowLeft") registerMove("left");
			else if (e.key == "ArrowDown") registerMove("down");
		}
	});

	//swipe detection
	var touchstartX = 0;
	var touchstartY = 0;
	var touchendX = 0;
	var touchendY = 0;

	$("div.container").on("touchstart", function (event) {
		event.preventDefault();
		touchstartX = event.originalEvent.changedTouches[0].pageX;
		touchstartY = event.originalEvent.changedTouches[0].pageY;
	});

	$("div.container").on("touchend", function (event) {
		event.preventDefault();
		touchendX = event.originalEvent.changedTouches[0].pageX;
		touchendY = event.originalEvent.changedTouches[0].pageY;
		handleGesure();
	});

	function handleGesure() {
		if (Math.abs(touchendX - touchstartX) > 100 && Math.abs(touchendY - touchstartY) > 100) {
			console.log("swipe unclear");
		} else if (touchendX < touchstartX - 150) {
			registerMove("left");
		} else if (touchendX > touchstartX + 150) {
			registerMove("right");
		} else if (touchendY > touchstartY + 150) {
			registerMove("down");
		}
	}
});

function registerMove(move) {
	console.log(move);
	if (move == "right") {
		if (myrowindex % 2 == 1 && lastmove != "left" && mycolindex < numcols) executeMove(move);
	} else if (move == "left") {
		if (myrowindex % 2 == 1 && lastmove != "right" && mycolindex > 1) executeMove(move);
	} else if (move == "down" && myrowindex < numrows) {
		let numbelow = rows[myrowindex][mycolindex - 1];
		if (myrowindex % 2 == 1 && currentnumber % numbelow == 0) executeMove(move);
		else if (myrowindex % 2 == 0) executeMove(move);
	}

	function executeMove(move) {
		lastmove = move;
		if (currentnumber <= 0) return;
		if (move == "right") {
			$(".cell[row=" + myrowindex + "][col=" + mycolindex + "]")
				.removeClass("active")
				.addClass("traveled");
			mycolindex++;
			currentnumber += rows[myrowindex - 1][mycolindex - 1];
		} else if (move == "left") {
			$(".cell[row=" + myrowindex + "][col=" + mycolindex + "]")
				.removeClass("active")
				.addClass("traveled");
			mycolindex--;
			currentnumber += rows[myrowindex - 1][mycolindex - 1];
		} else if (move == "down") {
			$(".cell[row=" + myrowindex + "][col=" + mycolindex + "]")
				.removeClass("active")
				.addClass("traveled");
			myrowindex++;
			if (myrowindex % 2 == 0) currentnumber = currentnumber / rows[myrowindex - 1][mycolindex - 1];
			else currentnumber += rows[myrowindex - 1][mycolindex - 1];
			if (myrowindex % 2 == 0) score--;
			$score.html(score);
		}
		//check for win condition
		if (currentnumber <= 0) {
			currentnumber = 0;
			$(".infobox").css("background", "lightgreen");
		}
		$(".cell[row=" + myrowindex + "][col=" + mycolindex + "]")
			.addClass("active")
			.append($("<span class='tooltip'>" + currentnumber + "</span>"));
		//check for loss condition
		if (myrowindex == numrows && ((mycolindex == 1 && move == "left") || (mycolindex == numcols && move == "right"))) {
			$(".infobox").css("background", "pink");
			$score.html("0");
		}
	}
}

function startGame() {
	myrowindex = 1;
	mycolindex = 8;
	score = 11;
	lastmove = "";
	currentnumber = 5040;
	$score.html(score);
	$(".tooltip").remove();
	$(".infobox").css("background", "white");
	rows = [];
	generateGame(numrows, numcols);
	let mynumber = 0;
	let myvalue = "";
	let myclass = "";
	for (let r = 1; r <= numrows; r++) {
		for (let c = 1; c <= numcols; c++) {
			mynumber = rows[r - 1][c - 1];
			if (mynumber == 0) {
				myvalue = "";
				myclass = "empty";
			} else if (r % 2 == 0) {
				myvalue = mynumber;
				myclass = "divide";
			} else if (mynumber > 0) {
				myvalue = mynumber;
				myclass = "add";
			} else {
				myvalue = Math.abs(mynumber);
				myclass = "sub";
			}
			let $cell = $("<div>")
				.html(myvalue)
				.addClass("cell " + myclass)
				.attr("row", r)
				.attr("col", c)
				.css("grid-row-start", r)
				.css("grid-column-start", c);
			$container.append($cell);
		}
	}
	$(".cell[row=1][col=8]")
		.addClass("active")
		.append($("<span class='tooltip'>" + currentnumber + "</span>"));
}

function generateGame(numrows, numcols) {
	let mediumdivs = mediumdivstemplate.slice(0);
	let largedivs = largedivstemplate.slice(0);
	for (let r = 1; r <= Math.floor(numrows / 2); r++) {
		rows.push(makeAddRow());
		rows.push(makeDivRow());
	}
	rows.push(makeAddRow());
	rows[0][7] = 0;

	function makeAddRow() {
		let array = addtemplate.slice(0);
		return shuffleArray(array);
	}

	function makeDivRow() {
		let mediumdivindex = getRandomInt(0, mediumdivs.length - 1);
		let largedivindex = getRandomInt(0, largedivs.length - 1);
		let mediumdiv = mediumdivs.splice(mediumdivindex, 1);
		let largediv = largedivs.splice(largedivindex, 1);
		let mydivs = shuffleArray([mediumdiv[0], largediv[0], 2, 2, 3]);
		let myrow = [1, 0, mydivs[0], 0, mydivs[1], 0, mydivs[2], 0, mydivs[3], 0, mydivs[4], 0, 1];
		let numsplices = numcols - myrow.length;
		for (let i = 0; i < numsplices; i++) {
			myrow.splice(getRandomInt(2, myrow.length - 2), 0, 0);
		}
		return myrow;
	}

	function getRandomInt(min, max) {
		//inclusive of min and max
		return Math.floor(Math.random() * (max + 1 - min) + min);
	}

	function shuffleArray(array) {
		let newArray = [];
		let length = array.length;
		for (let i = 0; i < length; i++) {
			let spliced = array.splice(getRandomInt(0, array.length - 1), 1);
			newArray.push(spliced[0]);
		}
		return newArray;
	}
}
