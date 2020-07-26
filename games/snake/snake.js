var Snake = {
	Info: {
		name: "Snake",
		path: "snake",
		description: "Classic Snake. Use WASD to move!"
	},
	Context: {},
	State: {},
	Resources: {
		tilesheet: "sprites.png"
	},
	Entities: {}
};

/* Initialization */
Snake.init = function(context, path) {
	Snake.State = {
		direction: 0,
		dragging: false,
		facing: 0,
		pellets: [],
		running: true,
		size: {scale: 1, width: 25, height: 20, total: 25 * 20},
		snake: [{x:10,y:9}, {x:10,y:10}],
		timer: 0,
		touching: false,
	};

	context.innerHTML = '<canvas id="canvas">Your browser doesn\'t support HTML5 Canvas!</canvas>';
	Snake.Context = document.getElementById('canvas').getContext('2d');

	Snake.Resources = Resources.load(Snake.Resources, path ? path : 'games/snake/');

	let resizefunc = function() {
		if(Snake.Context.canvas.parentElement.clientWidth < Snake.Context.canvas.parentElement.clientHeight) {
			Snake.Context.canvas.width  = Snake.Context.canvas.parentElement.clientWidth;
			Snake.Context.canvas.height = Snake.Context.canvas.parentElement.clientWidth;
		} else {
			Snake.Context.canvas.width  = Snake.Context.canvas.parentElement.clientHeight*Snake.State.size.width/Snake.State.size.height;
			Snake.Context.canvas.height = Snake.Context.canvas.parentElement.clientHeight;
		}
	};
	window.addEventListener("resize", resizefunc);
	resizefunc();

	Snake.Context.canvas.addEventListener("mousedown", function(e) {
		if(Snake.State.touching !== false) return;
		Snake.State.dragging = true;
		Snake.State.startX = e.x;
		Snake.State.startY = e.y;
	});

	Snake.Context.canvas.addEventListener("mouseup", function(e) {
		if(Snake.State.touching !== false) return;
		Snake.State.dragging = false;
		Snake.HandleGestures(
			e.x - Snake.State.startX,
			e.y - Snake.State.startY
		);
	});

	Snake.Context.canvas.addEventListener("touchstart", function(e) {
		if(Snake.State.dragging) return;
		Snake.State.touching = e.changedTouches[0].identifier;
		Snake.State.startX = e.changedTouches[0].clientX;
		Snake.State.startY = e.changedTouches[0].clientY;
	});

	Snake.Context.canvas.addEventListener("touchend", function(e) {
		if(Snake.State.dragging) return;

		for (var touch of e.changedTouches) {
			if(Snake.State.touching == touch.identifier) {
				Snake.State.touching = false;
				Snake.HandleGestures(
					e.changedTouches[0].clientX - Snake.State.startX,
					e.changedTouches[0].clientY - Snake.State.startY
				);
				break;
			}
		}
	});

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

Snake.HandleGestures = function(dx, dy) {
	var biggest = Math.max(dx, -dx, dy, -dy);
	if(biggest <= 10) return;

	if(dx == biggest) { // right
		Keyboard.add(39);
	} else if(-dx == biggest) { // left
		Keyboard.add(37);
	} else if(dy == biggest) { // down
		Keyboard.add(40);
	} else if(-dy == biggest) { // up
		Keyboard.add(38);
	}
}

Snake.events = function(state, context, res) {
	if(Keyboard.size == 1) {
		if((Keyboard.delete(87) || Keyboard.delete(73) || Keyboard.delete(38)) && state.direction != 2) state.direction = 0; // KeyW
		if((Keyboard.delete(68) || Keyboard.delete(76) || Keyboard.delete(39)) && state.direction != 3) state.direction = 1; // KeyD
		if((Keyboard.delete(83) || Keyboard.delete(75) || Keyboard.delete(40)) && state.direction != 0) state.direction = 2; // KeyS
		if((Keyboard.delete(65) || Keyboard.delete(74) || Keyboard.delete(37)) && state.direction != 1) state.direction = 3; // KeyA
	}
}

/* Game update logic */
Snake.logic = function(state, context, res) {
	if(state.timer > 200) {
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
			Snake.State.running = false;
			setTimeout(function() {
				state.snake = [{x:10,y:9}, {x:10,y:10}];
				state.direction = state.facing = 0;
				Snake.State.running = true;
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
	state.timer += Timing.delta;
}

/* Renderer */
Snake.render = function(state, context, res) {
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

		context.drawImage(Snake.Resources.tilesheet, 0, 64*tile - 0.5, 64, 64, -xs/2, -ys/2, xs, ys);
		context.restore();
	}
}

/* Gameloop */
Snake.loop = function() {
	Timing.refresh();

	if (Snake.State.running) {
		Snake.events(Snake.State, Snake.Context, Snake.Resources);
		Snake.logic(Snake.State, Snake.Context, Snake.Resources);
	}
	Snake.render(Snake.State, Snake.Context, Snake.Resources);

	requestAnimationFrame(Snake.loop);
}

/* Start */
addEventListener("load", function(){if(typeof Loader !== "undefined") Loader.register(Snake);});
