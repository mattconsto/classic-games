let context = [];
let running = true;
let size    = {scale: 1, width: 4, height: 4, total: 4 * 4};
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

Element.prototype.remove = function() {
	this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
	for(var i = this.length - 1; i >= 0; i--) {
		if(this[i] && this[i].parentElement) {
			this[i].parentElement.removeChild(this[i]);
		}
	}
}

var TwoZeroFourEight = {
	State: {
		map: new Array(size.total).fill(0)
	},
	Resources: {
		blip: new Audio('media/blip.wav'),
		tone: new Audio('media/tone.wav')
	},
	Entities: {}
};

/* Initialization */
TwoZeroFourEight.init = function() {
	context = document.getElementById("tiles-2048");

	let playButton = document.getElementById('play-button');
	playButton.onclick = function() {
		running = !running;
		console.log(running ? "Running" : "Paused");
		playButton.childNodes[0].innerHTML = running ? "pause" : "play_arrow";
		playButton.childNodes[0].title	 = running ? "Pause" : "Play";
	}

	document.addEventListener("visibilitychange", function() {
		if(document.hidden) {
			running = false;
			console.log("Paused");
			playButton.childNodes[0].innerHTML = "pause";
			playButton.childNodes[0].title	 = "Pause";
		}
	});

	/* Input events */
	document.onkeydown = function(e) {keyset.add(e.keyCode);}
	document.onkeyup   = function(e) {keyset.delete(e.keyCode)}

	TwoZeroFourEight.State.map[Math.round(Math.randomRange(0, size.total))] = 2;
	TwoZeroFourEight.State.map[Math.round(Math.randomRange(0, size.total))] = 2;
	TwoZeroFourEight.State.map[Math.round(Math.randomRange(0, size.total))] = 2;
	
	context.innerHTML = "";
	for(let i = 0; i < size.total; i++) {
		if(TwoZeroFourEight.State.map[i] != 0) context.innerHTML += '<span class="tile r{0} c{1}" title="{2}" />'.format(~~(i/size.height), i%size.width, TwoZeroFourEight.State.map[i]);
	}

	TwoZeroFourEight.loop();
}

let timeout = 200;

TwoZeroFourEight.events = function(state, res) {
	if(timeout >= 200 && keyset.size == 1) {
		let moved = false;

		switch(keyset.values().next().value) {
			case 87: { // KeyW
				for(let y = 1; y < size.height; y++) {
					for(let x = 0; x < size.width; x++) {
						if(state.map[y*size.width+x] != 0) {
							let j = x, k = y;
							for(; k > 0; k--) {
								if(state.map[(k-1)*size.width+j] == 0) {
									// If blank we can continue to move.
									continue;
								} else if(state.map[(k-1)*size.width+j] == state.map[y*size.width+x]) {
									// Values are the same, so we continue to push.
									state.map[y*size.width+x] += state.map[(k-1)*size.width+j];
									state.map[(k-1)*size.width+j] = 0;

									context.querySelector(".tile.r{0}.c{1}".format(y, x)).setAttribute("title", state.map[y*size.width+x]);
									context.querySelector(".tile.r{0}.c{1}".format(k-1, j)).remove();
								} else break;
							}

							if(j != x || k != y) {
								// Swap
								state.map[k*size.width+j] = state.map[y*size.width+x];
								state.map[y*size.width+x] = 0;

								context.querySelector(".tile.r{0}.c{1}".format(y, x)).setAttribute("class", "tile r{0} c{1}".format(k, j));

								moved = true;
							}
						}
					}
				}
			} break;
			case 83: { // KeyS
				for(let y = size.height - 1; y >= 0 ; y--) {
					for(let x = 0; x < size.width; x++) {
						if(state.map[y*size.width+x] != 0) {
							let j = x, k = y;
							for(; k < size.height - 1; k++) {
								if(state.map[(k+1)*size.width+j] == 0) {
									// If blank we can continue to move.
									continue;
								} else if(state.map[(k+1)*size.width+j] == state.map[y*size.width+x]) {
									// Values are the same, so we continue to push.
									state.map[y*size.width+x] += state.map[(k+1)*size.width+j];
									state.map[(k+1)*size.width+j] = 0;

									context.querySelector(".tile.r{0}.c{1}".format(y, x)).setAttribute("title", state.map[y*size.width+x]);
									context.querySelector(".tile.r{0}.c{1}".format(k+1, j)).remove();
								} else break;
							}

							if(j != x || k != y) {
								// Swap
								state.map[k*size.width+j] = state.map[y*size.width+x];
								state.map[y*size.width+x] = 0;

								context.querySelector(".tile.r{0}.c{1}".format(y, x)).setAttribute("class", "tile r{0} c{1}".format(k, j));

								moved = true;
							}
						}
					}
				}
			} break;
			case 65: { // KeyA
				for(let x = 1; x < size.width; x++) {
					for(let y = 0; y < size.height; y++) {
						if(state.map[y*size.width+x] != 0) {
							let j = x, k = y;
							for(; j > 0; j--) {
								if(state.map[y*size.width+j-1] == 0) {
									// If blank we can continue to move.
									continue;
								} else if(state.map[k*size.width+j-1] == state.map[y*size.width+x]) {
									// Values are the same, so we continue to push.
									state.map[y*size.width+x] += state.map[k*size.width+j-1];
									state.map[k*size.width+j-1] = 0;

									context.querySelector(".tile.r{0}.c{1}".format(y, x)).setAttribute("title", state.map[y*size.width+x]);
									context.querySelector(".tile.r{0}.c{1}".format(k, j-1)).remove();
								} else break;
							}

							if(j != x || k != y) {
								// Swap
								state.map[k*size.width+j] = state.map[y*size.width+x];
								state.map[y*size.width+x] = 0;

								context.querySelector(".tile.r{0}.c{1}".format(y, x)).setAttribute("class", "tile r{0} c{1}".format(k, j));

								moved = true;
							}
						}
					}
				}
			} break;
			case 68: { // KeyD
				for(let x = size.width - 1; x >= 0; x--) {
					for(let y = 0; y < size.height; y++) {
						if(state.map[y*size.width+x] != 0) {
							let j = x, k = y;
							for(; j < size.width - 1; j++) {
								if(state.map[y*size.width+j+1] == 0) {
									// If blank we can continue to move.
									continue;
								} else if(state.map[k*size.width+j+1] == state.map[y*size.width+x]) {
									// Values are the same, so we continue to push.
									state.map[y*size.width+x] += state.map[k*size.width+j+1];
									state.map[k*size.width+j+1] = 0;

									context.querySelector(".tile.r{0}.c{1}".format(y, x)).setAttribute("title", state.map[y*size.width+x]);
									context.querySelector(".tile.r{0}.c{1}".format(k, j+1)).remove();
								} else break;
							}

							if(j != x || k != y) {
								// Swap
								state.map[k*size.width+j] = state.map[y*size.width+x];
								state.map[y*size.width+x] = 0;

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
			for(let i = 0; i < size.total; i++) if(state.map[i] == 0) spaces.push(i);
			let space = spaces[Math.floor(Math.randomRange(0, spaces.length))];
			let number = Math.random() > 0.5 ? 2 : 4;
			state.map[space] = number;
			context.innerHTML += '<span class="tile r{0} c{1}" title="{2}" />'.format(~~(space/size.height), space%size.width, number);
		}

		timeout = 0;
	}

	timeout += delta;
}

/* Game update logic */
TwoZeroFourEight.logic = function(state, res) {

}

/* Renderer */
TwoZeroFourEight.render = function(state, res) {
	context.innerHTML = "";
	for(let i = 0; i < size.total; i++) {
		if(state.map[i] != 0) context.innerHTML += '<span class="tile r{0} c{1}" title="{2}" />'.format(~~(i/size.height), i%size.width, state.map[i]);
	}
}

/* Gameloop */

TwoZeroFourEight.loop = function() {
	let now = window.performance.now();
	delta = now - time;
	time = now;

	TwoZeroFourEight.events(TwoZeroFourEight.State, TwoZeroFourEight.Resources);
	// if (running) TwoZeroFourEight.logic(TwoZeroFourEight.State, TwoZeroFourEight.Resources);
	// TwoZeroFourEight.render(TwoZeroFourEight.State, TwoZeroFourEight.Resources);

	requestAnimationFrame(TwoZeroFourEight.loop);
}

/* Start */
window.addEventListener("load", TwoZeroFourEight.init, false);