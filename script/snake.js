let canvas  = [];
let context = [];
let running = true;
let size    = {scale: 16, width: 512, height: 512, total: 512 * 512};
let keyset  = new Set();
let time    = window.performance.now();
let delta   = 1000/60;

Math.limit = function(val, min, max) {
	return val < min ? min : (val > max ? max : val);
}

Math.randomRange = function(a, b) {
	if(typeof a === "undefined") {
		min = 0; max = Number.MAX_SAFE_INTEGER;
	} else if(typeof b === "undefined") {
		min = 0; max = a
	} else {
		min = a; max = b;
	}
	return Math.random() * (max - min) + min;
}

var Snake = {
	State: {

	},
	Resources: {
		blip: new Audio('media/blip.wav'),
		tone: new Audio('media/tone.wav')
	},
	Entities: {}
};

/* Initialization */
Snake.init = function() {
	canvas  = document.getElementById('canvas');
	context = canvas.getContext('2d');

	canvas.height = size.height;
	canvas.width  = size.width;

	let resizefunc = function() {
		console.log("Resize");
		if(window.innerWidth < window.innerHeight-64) {
			canvas.width  = window.innerWidth;
			canvas.height = window.innerWidth;
			size.scale = canvas.width/50;
		} else {
			canvas.width  = (window.innerHeight-64)*size.height/size.width;
			canvas.height = (window.innerHeight-64);
			size.scale = canvas.width/50;
		}
	};
	window.addEventListener("resize", resizefunc);
	resizefunc();

	let playButton = document.getElementById('play-button');
	playButton.onclick = function() {
		running = !running;
		console.log(running ? "Running" : "Paused");
		playButton.childNodes[0].innerHTML = running ? "pause" : "play_arrow";
		playButton.childNodes[0].title     = running ? "Pause" : "Play";
	}

	document.addEventListener("visibilitychange", function() {
		if(document.hidden) {
			running = false;
			console.log("Paused");
			playButton.childNodes[0].innerHTML = "pause";
			playButton.childNodes[0].title     = "Pause";
		}
	});

	/* Input events */
	document.onkeydown = function(e) {keyset.add(e.keyCode);}
	document.onkeyup   = function(e) {keyset.delete(e.keyCode)}

	Snake.loop();
}

Snake.events = function(state, res) {

}

/* Game update logic */
Snake.logic = function(state, res) {

}

/* Renderer */
Snake.render = function(state) 

}

/* Gameloop */

Snake.loop = function() {
	let now = window.performance.now();
	delta = now - time;
	time = now;

	Snake.events(Snake.State, Snake.Resources);
	if (running) Snake.logic(Snake.State, Snake.Resources);
	Snake.render(Snake.State, Snake.Resources);

	requestAnimationFrame(Snake.loop);
}

/* Start */
window.addEventListener("load", Snake.init, false);