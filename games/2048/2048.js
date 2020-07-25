var TwoZeroFourEight = {
	Info: {
		name: "2048",
		path: "2048",
		description: "Classic 2048!"
	},
	Context: {},
	State: {
		size: {scale: 1, width: 4, height: 4, total: 4 * 4},
		map: new Array(4 * 4).fill(0),
		timeout: 200
	},
	Resources: {},
	Entities: {}
};

/* Initialization */
TwoZeroFourEight.init = function(context) {
	context.innerHTML = '	<div id="canvas-2048">\
		<div>\
			<div id="grid-2048">\
				<span class="tile r1 c1"></span>\
				<span class="tile r1 c2"></span>\
				<span class="tile r1 c3"></span>\
				<span class="tile r1 c4"></span>\
				<span class="tile r2 c1"></span>\
				<span class="tile r2 c2"></span>\
				<span class="tile r2 c3"></span>\
				<span class="tile r2 c4"></span>\
				<span class="tile r3 c1"></span>\
				<span class="tile r3 c2"></span>\
				<span class="tile r3 c3"></span>\
				<span class="tile r3 c4"></span>\
				<span class="tile r4 c1"></span>\
				<span class="tile r4 c2"></span>\
				<span class="tile r4 c3"></span>\
				<span class="tile r4 c4"></span>\
			</div>\
\
			<div id="tiles-2048"></div>\
		</div>\
	</div>';

	TwoZeroFourEight.Context = document.getElementById("tiles-2048");
	TwoZeroFourEight.Context.canvas = TwoZeroFourEight.Context.parentElement.parentElement;

	let resizefunc = function() {
		if(TwoZeroFourEight.Context.canvas.parentElement.clientWidth*TwoZeroFourEight.State.size.height/TwoZeroFourEight.State.size.width < TwoZeroFourEight.Context.canvas.parentElement.clientHeight) {
			TwoZeroFourEight.Context.canvas.style.width  = TwoZeroFourEight.Context.canvas.parentElement.clientWidth + "px";
			TwoZeroFourEight.Context.canvas.style.height = TwoZeroFourEight.Context.canvas.parentElement.clientWidth*TwoZeroFourEight.State.size.height/TwoZeroFourEight.State.size.width + "px";
		} else {
			TwoZeroFourEight.Context.canvas.style.width  = TwoZeroFourEight.Context.canvas.parentElement.clientHeight*TwoZeroFourEight.State.size.width/TwoZeroFourEight.State.size.height + "px";
			TwoZeroFourEight.Context.canvas.style.height = TwoZeroFourEight.Context.canvas.parentElement.clientHeight + "px";
		}
	};
	window.addEventListener("resize", resizefunc);
	resizefunc();

	TwoZeroFourEight.State.map[Math.round(Math.randomRange(0, TwoZeroFourEight.State.size.total))] = 2;
	TwoZeroFourEight.State.map[Math.round(Math.randomRange(0, TwoZeroFourEight.State.size.total))] = 2;
	TwoZeroFourEight.State.map[Math.round(Math.randomRange(0, TwoZeroFourEight.State.size.total))] = 2;
	
	TwoZeroFourEight.Context.innerHTML = "";
	for(let i = 0; i < TwoZeroFourEight.State.size.total; i++) {
		if(TwoZeroFourEight.State.map[i] != 0) TwoZeroFourEight.Context.innerHTML += '<span class="tile r{0} c{1}" title="{2}" />'.format(~~(i/TwoZeroFourEight.State.size.height), i%TwoZeroFourEight.State.size.width, TwoZeroFourEight.State.map[i]);
	}

	TwoZeroFourEight.loop();
}

TwoZeroFourEight.events = function(state, context, res) {
	if(state.timeout >= 200 && Keyboard.size == 1) {
		let moved = false;

		switch(Keyboard.values().next().value) {
			case 87: case 73: case 38: { // KeyW
				for(let y = 1; y < state.size.height; y++) {
					for(let x = 0; x < state.size.width; x++) {
						if(state.map[y*state.size.width+x] != 0) {
							let j = x, k = y;
							for(; k > 0; k--) {
								if(state.map[(k-1)*state.size.width+j] == 0) {
									// If blank we can continue to move.
									continue;
								} else if(state.map[(k-1)*state.size.width+j] == state.map[y*state.size.width+x]) {
									// Values are the same, so we continue to push.
									state.map[y*state.size.width+x] += state.map[(k-1)*state.size.width+j];
									state.map[(k-1)*state.size.width+j] = 0;

									context.querySelector(".tile.r{0}.c{1}".format(y, x)).setAttribute("title", state.map[y*state.size.width+x]);
									context.querySelector(".tile.r{0}.c{1}".format(k-1, j)).remove();
								} else break;
							}

							if(j != x || k != y) {
								// Swap
								state.map[k*state.size.width+j] = state.map[y*state.size.width+x];
								state.map[y*state.size.width+x] = 0;

								context.querySelector(".tile.r{0}.c{1}".format(y, x)).setAttribute("class", "tile r{0} c{1}".format(k, j));

								moved = true;
							}
						}
					}
				}
			} break;
			case 83: case 75: case 40: { // KeyS
				for(let y = state.size.height - 1; y >= 0 ; y--) {
					for(let x = 0; x < state.size.width; x++) {
						if(state.map[y*state.size.width+x] != 0) {
							let j = x, k = y;
							for(; k < state.size.height - 1; k++) {
								if(state.map[(k+1)*state.size.width+j] == 0) {
									// If blank we can continue to move.
									continue;
								} else if(state.map[(k+1)*state.size.width+j] == state.map[y*state.size.width+x]) {
									// Values are the same, so we continue to push.
									state.map[y*state.size.width+x] += state.map[(k+1)*state.size.width+j];
									state.map[(k+1)*state.size.width+j] = 0;

									context.querySelector(".tile.r{0}.c{1}".format(y, x)).setAttribute("title", state.map[y*state.size.width+x]);
									context.querySelector(".tile.r{0}.c{1}".format(k+1, j)).remove();
								} else break;
							}

							if(j != x || k != y) {
								// Swap
								state.map[k*state.size.width+j] = state.map[y*state.size.width+x];
								state.map[y*state.size.width+x] = 0;

								context.querySelector(".tile.r{0}.c{1}".format(y, x)).setAttribute("class", "tile r{0} c{1}".format(k, j));

								moved = true;
							}
						}
					}
				}
			} break;
			case 65: case 74: case 37: { // KeyA
				for(let x = 1; x < state.size.width; x++) {
					for(let y = 0; y < state.size.height; y++) {
						if(state.map[y*state.size.width+x] != 0) {
							let j = x, k = y;
							for(; j > 0; j--) {
								if(state.map[y*state.size.width+j-1] == 0) {
									// If blank we can continue to move.
									continue;
								} else if(state.map[k*state.size.width+j-1] == state.map[y*state.size.width+x]) {
									// Values are the same, so we continue to push.
									state.map[y*state.size.width+x] += state.map[k*state.size.width+j-1];
									state.map[k*state.size.width+j-1] = 0;

									context.querySelector(".tile.r{0}.c{1}".format(y, x)).setAttribute("title", state.map[y*state.size.width+x]);
									context.querySelector(".tile.r{0}.c{1}".format(k, j-1)).remove();
								} else break;
							}

							if(j != x || k != y) {
								// Swap
								state.map[k*state.size.width+j] = state.map[y*state.size.width+x];
								state.map[y*state.size.width+x] = 0;

								context.querySelector(".tile.r{0}.c{1}".format(y, x)).setAttribute("class", "tile r{0} c{1}".format(k, j));

								moved = true;
							}
						}
					}
				}
			} break;
			case 68: case 76: case 39: { // KeyD
				for(let x = state.size.width - 1; x >= 0; x--) {
					for(let y = 0; y < state.size.height; y++) {
						if(state.map[y*state.size.width+x] != 0) {
							let j = x, k = y;
							for(; j < state.size.width - 1; j++) {
								if(state.map[y*state.size.width+j+1] == 0) {
									// If blank we can continue to move.
									continue;
								} else if(state.map[k*state.size.width+j+1] == state.map[y*state.size.width+x]) {
									// Values are the same, so we continue to push.
									state.map[y*state.size.width+x] += state.map[k*state.size.width+j+1];
									state.map[k*state.size.width+j+1] = 0;

									context.querySelector(".tile.r{0}.c{1}".format(y, x)).setAttribute("title", state.map[y*state.size.width+x]);
									context.querySelector(".tile.r{0}.c{1}".format(k, j+1)).remove();
								} else break;
							}

							if(j != x || k != y) {
								// Swap
								state.map[k*state.size.width+j] = state.map[y*state.size.width+x];
								state.map[y*state.size.width+x] = 0;

								context.querySelector(".tile.r{0}.c{1}".format(y, x)).setAttribute("class", "tile r{0} c{1}".format(k, j));

								moved = true;
							}
						}
					}
				}
			} break;
		}

		if(moved) {
			// Add a random number into a random cell.
			let spaces = [];
			for(let i = 0; i < state.size.total; i++) if(state.map[i] == 0) spaces.push(i);
			let space = spaces[Math.floor(Math.randomRange(0, spaces.length))];
			let number = Math.random() > 0.5 ? 2 : 4;
			state.map[space] = number;
			context.innerHTML += '<span class="tile r{0} c{1}" title="{2}" />'.format(~~(space/state.size.height), space%state.size.width, number);
		}

		state.timeout = 0;
	}

	state.timeout += Timing.delta;
}

/* Gameloop */

TwoZeroFourEight.loop = function() {
	Timing.refresh();

	TwoZeroFourEight.events(TwoZeroFourEight.State, TwoZeroFourEight.Context, TwoZeroFourEight.Resources);

	requestAnimationFrame(TwoZeroFourEight.loop);
}

/* Start */
addEventListener("load", function(){if(typeof Loader !== "undefined") Loader.register(TwoZeroFourEight);});
