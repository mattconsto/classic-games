let canvas  = [];
let context = [];
let running = true;
let keyset  = new Set();
let time    = window.performance.now();
let delta   = 1000/60;

var Snake = {
	Info: {
		name: "Snake",
		path: "Snake",
		description: "Classic Snake. Use WASD to move!"
	},
	State: {
		size: {scale: 1, width: 20, height: 20, total: 20 * 20},
		pellets: [],
		snake: [],
		direction: 0,
		facing: 0,
		timer: 0
	},
	Resources: {
		tilesheet: []
	},
	Entities: {}
};

/* Initialization */
Snake.init = function() {
	canvas  = document.getElementById('canvas');
	context = canvas.getContext('2d');

	canvas.height = Snake.State.size.height;
	canvas.width  = Snake.State.size.width;

	Snake.Resources.tilesheet = new Image();
	Snake.Resources.tilesheet.src = "games/snake/sprites.png"; // http://rembound.com/articles/creating-a-snake-game-tutorial-with-html5 Just the image, code is 100% original.

	let resizefunc = function() {
		console.log("Resize");
		if(window.innerWidth < window.innerHeight-64) {
			canvas.width  = window.innerWidth;
			canvas.height = window.innerWidth;
		} else {
			canvas.width  = (window.innerHeight-64)*Snake.State.size.height/Snake.State.size.width;
			canvas.height = (window.innerHeight-64);
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

	Snake.State.snake = [{x:10,y:9}, {x:10,y:10}];

	let position = {x:-1, y:-1};
	for(let t = 0; t < 100; t++) {
		position = {x:Math.floor(Math.randomRange(0, Snake.State.size.width)), y:Math.floor(Math.randomRange(0, Snake.State.size.height))};

		let check = true;
		for(let i = 0; i < Snake.State.snake.length; i++) {
			if(Snake.State.snake[i].x == position.x && Snake.State.snake[i].y == position.y) {
				check = false;
				break;
			}
		}
		if(check == true) break;
	}

	Snake.State.pellets.push(position);

	Snake.loop();
}

Snake.events = function(state, res) {
	if(keyset.size == 1) {
		if(keyset.has(87) && state.direction != 2) state.direction = 0; // KeyW
		if(keyset.has(68) && state.direction != 3) state.direction = 1; // KeyD
		if(keyset.has(83) && state.direction != 0) state.direction = 2; // KeyS
		if(keyset.has(65) && state.direction != 1) state.direction = 3; // KeyA
	}
}

/* Game update logic */
Snake.logic = function(state, res) {
	if(state.timer > 150) {
		let segment = {x:state.snake[0].x,y:state.snake[0].y};
		switch(state.direction % 4) {
			case 0: segment.y--;break; // North
			case 1: segment.x++;break; // East
			case 2: segment.y++;break; // South
			case 3: segment.x--;break; // West
		}

		// Check if we google ourselves.
		let gobbled = false;

		if(segment.x < 0 || segment.x >= state.size.width || segment.y < 0 || segment.y >= state.size.height) gobbled = true;

		for(let i = 0; i < state.snake.length; i++) {
			if(segment.x == state.snake[i].x && segment.y == state.snake[i].y) {
				gobbled = true;
				break;
			}
		}
		if(gobbled) {
			state.snake[0].o = Math.PI*(state.direction%4)/2;
			running = false;
			setTimeout(function() {
				state.snake = [{x:10,y:9}, {x:10,y:10}];
				state.direction = state.facing = 0;
				running = true;
			}, 1000);
			return;
		} else {
			state.snake.unshift(segment);
		}

		state.snake[state.snake.length-1].o = state.snake[state.snake.length-2].o;

		// Check if we gobble a pellet
		for(let p = 0; p < state.pellets.length; p++) {
			if(state.pellets[p].x == state.snake[0].x && state.pellets[p].y == state.snake[0].y) {
				state.pellets.splice(p);

				let position = {x:-1, y:-1};
				for(let t = 0; t < 100; t++) {
					position = {x:Math.floor(Math.randomRange(0, Snake.State.size.width)), y:Math.floor(Math.randomRange(0, Snake.State.size.height))};

					let check = true;
					for(let i = 0; i < Snake.State.snake.length; i++) {
						if(Snake.State.snake[i].x == position.x && Snake.State.snake[i].y == position.y) {
							check = false;
							break;
						}
					}
					if(check == true) break;
				}

				Snake.State.pellets.push(position);
			} else {
				state.snake.pop();
			}

			state.facing = state.direction;

			state.timer = 0;
		}
	}
	state.timer += delta;
}

/* Renderer */
Snake.render = function(state) {
	context.fillStyle = "#F7E592";
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);

	let xs = context.canvas.width/state.size.width;
	let ys = context.canvas.height/state.size.height;

	for(let i = 0; i < state.pellets.length; i++) {
		context.drawImage(Snake.Resources.tilesheet, 0, 0, 64, 64, xs*state.pellets[i].x, ys*state.pellets[i].y, xs, ys);
	}

	for(let i = 0; i < state.snake.length; i++) {
		let tile = i > 0 ? (i < state.snake.length-1 ? 2 : 3) : 1;
		context.save();
		context.translate(xs*state.snake[i].x+xs/2, ys*state.snake[i].y+ys/2);
		if(i == 0) {
			context.rotate(Math.PI*state.facing/2);
		} else if(i == state.snake.length - 1) {
			let a = state.snake[i-1];
			let b = state.snake[i];

			if(b.y > a.y) context.rotate(Math.PI*0/2);
			if(b.x < a.x) context.rotate(Math.PI*1/2);
			if(b.y < a.y) context.rotate(Math.PI*2/2);
			if(b.x > a.x) context.rotate(Math.PI*3/2);
		} else {
			let a = state.snake[i-1];
			let b = state.snake[i];
			let c = state.snake[i+1];

			if(a.x != c.x && a.y == c.y) {
				context.rotate(Math.PI*1/2);
			} else if(a.x == c.x && a.y != c.y) {
				context.rotate(Math.PI*0/2);
			} else {
				tile = 4;
				if((b.x > a.x && c.y < b.y) || (b.y > a.y && c.x < b.x)) context.rotate(Math.PI*0/2);
				if((b.x < a.x && c.y < b.y) || (b.y > a.y && c.x > b.x)) context.rotate(Math.PI*1/2);
				if((b.x < a.x && c.y > b.y) || (b.y < a.y && c.x > b.x)) context.rotate(Math.PI*2/2);
				if((b.x > a.x && c.y > b.y) || (b.y < a.y && c.x < b.x)) context.rotate(Math.PI*3/2);
			}
		}

		context.drawImage(Snake.Resources.tilesheet, 0, 64*tile, 64, 64, -xs/2, -ys/2, xs, ys);
		context.restore();
	}
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