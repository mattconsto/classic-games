let canvas  = [];
let context = [];

let running = true;
let size    = {scale: 1, width: 640, height: 480, total: 640 * 480};
let scale   = 6;

let score1  = 0;
let score2  = 0;
let paddle1 = {x: 0.1, y: 0.4, l: 0.2};
let paddle2 = {x: 0.9, y: 0.4, l: 0.2}; 
let ball    = {x: 0.5, y: 0.5, v:1, a:(Math.random() > 0.5 ? (Math.random()*Math.PI/2-Math.PI/8) : (Math.random()*Math.PI/2+Math.PI/8*5))};
let ai      = false;

let blip = new Audio('media/blip.wav');
let tone = new Audio('media/tone.wav');

/* Initialization */
function init() {
	canvas  = document.getElementById('canvas');
	context = canvas.getContext('2d');

	let resizefunc = function() {
		if(window.innerWidth*size.height/size.width < (window.innerHeight-64)) {
			canvas.width  = window.innerWidth;
			canvas.height = window.innerWidth*size.height/size.width;
			scale = canvas.width/64;
		} else {
			canvas.width  = (window.innerHeight-64)*size.width/size.height;
			canvas.height = (window.innerHeight-64);
			scale = canvas.width/64;
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

	document.getElementById('players-toggle').addEventListener("change", function(e) {
		ai = e.target.checked;
	});

	loop();
}

/* Input events */
let keyset         = new Set();
document.onkeydown = function(e) {keyset.add(e.keyCode);}
document.onkeyup   = function(e) {keyset.delete(e.keyCode)}

function events() {
	if(keyset.has(87) && !keyset.has(83)) paddle1.y = Math.limit(paddle1.y - delta*0.02, 0, 1-paddle1.l); // KeyW
	if(keyset.has(83) && !keyset.has(87)) paddle1.y = Math.limit(paddle1.y + delta*0.02, 0, 1-paddle1.l); // KeyS

	if(!ai && keyset.has(38) && !keyset.has(40)) paddle2.y = Math.limit(paddle2.y - delta*0.02, 0, 1-paddle2.l); // ArrowUp
	if(!ai && keyset.has(40) && !keyset.has(38)) paddle2.y = Math.limit(paddle2.y + delta*0.02, 0, 1-paddle2.l); // ArrowDown
}

/* Game update logic */
function logic() {
	/* Update positions */
	ball.x += Math.cos(ball.a)*ball.v*delta*0.005;
	ball.y += Math.sin(ball.a)*ball.v*delta*0.005;

	// paddle1.y = Math.limit(ball.y - paddle1.l/2, scale, size.height-scale-paddle1.l);
	if(ai) paddle2.y = Math.limit(ball.y - paddle2.l/2, 0, 1-paddle2.l);

	/* Bounce ball of wall */
	if(ball.y <= scale/canvas.height || ball.y >= 1 - 2*scale/canvas.height) {
		ball.a = 2*Math.PI - ball.a;
		blip.play();
	}

	/* Bounce ball of paddle, taking into account where the ball hit */
	if(Math.round(ball.x*30) == 3 && ball.y >= paddle1.y && ball.y <= paddle1.y + paddle1.l) {
		ball.a = Math.PI - ball.a - (ball.y - paddle1.y - paddle1.l/2)/paddle1.l*Math.PI/4;
		ball.v = Math.min(2, ball.v + 0.05); //.limitit speed to prevent ball passing through paddle.
		blip.play();
	}

	if(Math.round(ball.x*30) == 27 && ball.y >= paddle2.y && ball.y <= paddle2.y + paddle2.l) {
		ball.a = Math.PI - ball.a - (ball.y - paddle2.y - paddle1.l/2)/paddle2.l*Math.PI/4;
		ball.v = Math.min(2, ball.v + 0.05);
		blip.play();
	}

	/* A point has been scored, time to reset */
	if(ball.x > 1) score1 += 1;
	if(ball.x < 0) score2 += 1;

	if(ball.x > 1 || ball.x < 0) {
		ball = {x: 0.5, y: 0.5, v:1, a:(Math.random() > 0.5 ? (Math.random()*Math.PI/2-Math.PI/8) : (Math.random()*Math.PI/2+Math.PI/8*5))};
		running = false;

		tone.play();
		setTimeout(function(){
			tone.pause();
			tone.currentTime = 0;
			running = true;
		}, 1000);
	}
}

/* Renderer */
function render() {
	context.font = 4*scale+"px Silkscreen";
	context.fillStyle = "#000000";
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, canvas.width, scale);
	context.fillRect(0, canvas.height-scale, canvas.width, scale);

	context.fillRect(paddle1.x*canvas.width, paddle1.y*canvas.height, scale, paddle1.l*canvas.height);
	context.fillRect(paddle2.x*canvas.width, paddle2.y*canvas.height, scale, paddle2.l*canvas.height);
	context.fillRect(ball.x*canvas.width, ball.y*canvas.height, scale, scale);

	for(let i = 0; i < canvas.height/2/scale; i++) context.fillRect(canvas.width/2, i*2*scale, scale, scale);
	
	context.fillText(score1, Math.round(canvas.width/4), 10*scale);
	context.fillText(score2, Math.round(canvas.width/4*3), 10*scale);
}

/* Gameloop */
let time  = window.performance.now();
let delta = 1000/60;

function loop() {
	let now = window.performance.now();
	delta = (now - time) / scale;

	events();
	if (running) logic();
	render();

	time = now;

	requestAnimationFrame(loop);
}

/* Start */
window.addEventListener("load", init, false);