/// <reference path="typings/globals/jquery/index.d.ts" />

//© Copyright 2022 · IMACS - Institute for Mathematics & Computer Science

var timeouts = [];
var rows = [];
var gameinprogress = false;
const addtemplate = [+1, +1, -1, -1, -1, +2, +2, -2, -2, +3, -3, -4, +4, -5, +5];
const mediumdivstemplate = [4, 5, 6, 4, 5, 6, 4, 5, 6, 5];
const largedivstemplate = [7, 8, 9, 10, 7, 8, 9, 10, 8, 9];
const numrows = 21; //must be odd
const numcols = 15; //prefer odd
var myrowindex, mycolindex;
var currentnumber = 5040;
var score = 11;
let $container, $score, $helptab;
var lastmove = "";

$(document).ready(function () {
	$container = $("div.container");
	$score = $("div.infoval.number");
	$helptab = $("div.helptab");

	$container.css("grid-template-rows", "repeat(" + numrows + ", 1fr)").css("grid-template-columns", "repeat(" + numcols + ", 1fr)");
	startGame();

	let myfirstvisit = localStorage.getItem("seven_firstvisit");
	if (myfirstvisit == undefined) {
		localStorage.setItem("seven_firstvisit", "false");
		$helptab.slideDown();
	}
	installPrompt();

	$("button.newgame").click(startGame);
	document.addEventListener("keydown", (e) => {
		e.preventDefault();
		if (!e.repeat) {
			if (e.key == "ArrowRight") registerMove("right");
			else if (e.key == "ArrowLeft") registerMove("left");
			else if (e.key == "ArrowDown") registerMove("down");
		}
	});

	$("button.showhelp").click(function () {
		hideTabs();
		$helptab.slideDown();
	});

	$("button.closetab").click(function () {
		hideTabs();
	});

	window.addEventListener("beforeunload", (event) => {
		if (gameinprogress) {
			event.preventDefault();
			event.returnValue = "";
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
		if (Math.abs(touchendX - touchstartX) > 50 && Math.abs(touchendY - touchstartY) > 50) {
			console.log("swipe unclear");
		} else if (touchendX < touchstartX - 75) {
			registerMove("left");
		} else if (touchendX > touchstartX + 75) {
			registerMove("right");
		} else if (touchendY > touchstartY + 75) {
			registerMove("down");
		}
	}
});

function hideTabs() {
	$helptab.slideUp();
}

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
		if (!gameinprogress) {
			$(".swipeme").css("display", "none");
			$("div.installprompt").remove();
		}
		gameinprogress = true;
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
			if (myrowindex % 2 == 0) {
				currentnumber = currentnumber / rows[myrowindex - 1][mycolindex - 1];
				score--;
				$score.html(score);
			} else {
				currentnumber += rows[myrowindex - 1][mycolindex - 1];
				if (myrowindex < numrows - 3) {
					let thisrow = myrowindex;
					for (let r = 0; r <= 1; r++) {
						for (let c = 1; c <= numcols; c++) {
							timeouts.push(
								setTimeout(function () {
									$(".cell[row=" + (r + thisrow + 3) + "][col=" + c + "]").removeClass("hidden");
								}, r * 500 + c * 25)
							);
						}
					}
				}
			}
		}
		//check for win condition
		if (currentnumber <= 0) {
			currentnumber = 0;
			$(".infobox").css("background", "lightgreen");
			gameinprogress = false;
		}
		$(".cell[row=" + myrowindex + "][col=" + mycolindex + "]")
			.addClass("active")
			.append($("<span class='tooltip center'>" + currentnumber + "</span>"));
		//check for loss condition
		if (myrowindex == numrows && ((mycolindex == 1 && move == "left") || (mycolindex == numcols && move == "right"))) {
			$(".infobox").css("background", "pink");
			$score.html("0");
			gameinprogress = false;
		}
		//see if we need to shift tooltip
		if (mycolindex >= numcols) {
			$("div.cell.active span.tooltip").removeClass("center").addClass("right");
		} else if (mycolindex <= 1) {
			$("div.cell.active span.tooltip").removeClass("center").addClass("left");
		}
	}
}

function startGame() {
	gameinprogress = false;
	for (var i = 0; i < timeouts.length; i++) {
		clearTimeout(timeouts[i]);
	}
	timeouts = [];
	myrowindex = 1;
	mycolindex = 8;
	score = 11;
	lastmove = "";
	currentnumber = 5040;
	$score.html(score);
	$(".cell").remove();
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
				.addClass("hidden")
				.attr("row", r)
				.attr("col", c)
				.css("grid-row-start", r)
				.css("grid-column-start", c);
			$container.append($cell);
		}
	}
	$(".cell[row=1][col=8]")
		.addClass("active")
		.append($("<span class='tooltip center'>" + currentnumber + "</span>"));
	for (let r = 1; r <= 5; r++) {
		for (let c = 1; c <= numcols; c++) {
			timeouts.push(
				setTimeout(function () {
					$(".cell[row=" + r + "][col=" + c + "]").removeClass("hidden");
				}, (r - 1) * 500 + c * 25)
			);
		}
	}
	if (window.matchMedia("(pointer: coarse)").matches) {
		$(".swipeme")
			.css("display", "flex")
			.width($container.width() * 0.7)
			.height($container.height() * 0.5);
	}
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

function installPrompt() {
	if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && window.navigator.standalone !== true) {
		let $prompt = $(
			"<div>" +
				'<svg class="close" fill="DodgerBlue" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.002 2.005c5.518 0 9.998 4.48 9.998 9.997 0 5.518-4.48 9.998-9.998 9.998-5.517 0-9.997-4.48-9.997-9.998 0-5.517 4.48-9.997 9.997-9.997zm0 8.933-2.721-2.722c-.146-.146-.339-.219-.531-.219-.404 0-.75.324-.75.749 0 .193.073.384.219.531l2.722 2.722-2.728 2.728c-.147.147-.22.34-.22.531 0 .427.35.75.751.75.192 0 .384-.073.53-.219l2.728-2.728 2.729 2.728c.146.146.338.219.53.219.401 0 .75-.323.75-.75 0-.191-.073-.384-.22-.531l-2.727-2.728 2.717-2.717c.146-.147.219-.338.219-.531 0-.425-.346-.75-.75-.75-.192 0-.385.073-.531.22z" fill-rule="nonzero"/></svg>' +
				"<div>Install this App to your iOS Device</div><div>Just tap" +
				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" fill="DodgerBlue"><path d="M30.3 13.7L25 8.4l-5.3 5.3-1.4-1.4L25 5.6l6.7 6.7z"/><path d="M24 7h2v21h-2z"/><path d="M35 40H15c-1.7 0-3-1.3-3-3V19c0-1.7 1.3-3 3-3h7v2h-7c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V19c0-.6-.4-1-1-1h-7v-2h7c1.7 0 3 1.3 3 3v18c0 1.7-1.3 3-3 3z"/></svg>' +
				"then 'Add to Home Screen'</div>" +
				"</div>"
		).addClass("installprompt");
		$("body").append($prompt);
		$("svg.close").click(function () {
			$prompt.remove();
		});
	}
	if (/Android/i.test(navigator.userAgent) && !window.matchMedia("(display-mode: standalone)").matches) {
		let $prompt = $(
			"<div>" +
				'<svg class="close" fill="DodgerBlue" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.002 2.005c5.518 0 9.998 4.48 9.998 9.997 0 5.518-4.48 9.998-9.998 9.998-5.517 0-9.997-4.48-9.997-9.998 0-5.517 4.48-9.997 9.997-9.997zm0 8.933-2.721-2.722c-.146-.146-.339-.219-.531-.219-.404 0-.75.324-.75.749 0 .193.073.384.219.531l2.722 2.722-2.728 2.728c-.147.147-.22.34-.22.531 0 .427.35.75.751.75.192 0 .384-.073.53-.219l2.728-2.728 2.729 2.728c.146.146.338.219.53.219.401 0 .75-.323.75-.75 0-.191-.073-.384-.22-.531l-2.727-2.728 2.717-2.717c.146-.147.219-.338.219-.531 0-.425-.346-.75-.75-.75-.192 0-.385.073-.531.22z" fill-rule="nonzero"/></svg>' +
				"<div>Install this App to your Android Device</div><div>Just tap" +
				'<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" width="40" height="40" fill="black" xmlns="http://www.w3.org/2000/svg"><path d="m12 16.495c1.242 0 2.25 1.008 2.25 2.25s-1.008 2.25-2.25 2.25-2.25-1.008-2.25-2.25 1.008-2.25 2.25-2.25zm0-6.75c1.242 0 2.25 1.008 2.25 2.25s-1.008 2.25-2.25 2.25-2.25-1.008-2.25-2.25 1.008-2.25 2.25-2.25zm0-6.75c1.242 0 2.25 1.008 2.25 2.25s-1.008 2.25-2.25 2.25-2.25-1.008-2.25-2.25 1.008-2.25 2.25-2.25z"/></svg>' +
				"then 'Install app'</div>" +
				"</div>"
		).addClass("installprompt");
		$("body").append($prompt);
		$("svg.close").click(function () {
			$prompt.remove();
		});
	}
}
