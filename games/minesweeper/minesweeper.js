let context = [];
let running = true;
let size    = {scale: 1, width: 8, height: 8, total: 8 * 8};
let keyset  = new Set();
let time    = window.performance.now();
let delta   = 1000/60;

var Minesweeper = {
	Info: {
		name: "Minesweeper",
		path: "minesweeper",
		description: "Classic Minesweeper!"
	},
	Context: {},
	State: {
		map: [],
		bombs: 16,
		time: 0,
		state: "pause"
	},
	Resources: {},
	Entities: {}
};

/* Initialization */
Minesweeper.init = function() {
	context = document.getElementById('canvas-minesweeper');

	let resizefunc = function() {
		if(window.innerWidth*size.height/size.width < (window.innerHeight-64)) {
			context.style.width  = window.innerWidth + "px";
			context.style.height = window.innerWidth*size.height/size.width + "px";
		} else {
			context.style.width  = (window.innerHeight-64)*size.width/size.height + "px";
			context.style.height = (window.innerHeight-64) + "px";
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

	document.onvisibilitychange = function() {
		if(document.hidden) {
			running = false;
			console.log("Paused");
			playButton.childNodes[0].innerHTML = "pause";
			playButton.childNodes[0].title     = "Pause";
		}
	};

	/* Input events */
	document.onkeydown = function(e) {keyset.add(e.keyCode);}
	document.onkeyup   = function(e) {keyset.delete(e.keyCode)}

	Minesweeper.State.state = "pause";
	Minesweeper.State.time = 0;
	Minesweeper.State.bombs = 16;
	document.getElementById("minesweeper-face").innerHTML = "😊";
	document.getElementById("minesweeper-face").onclick = Minesweeper.init;

	// Setup world
	for(let i = 0; i < size.total; i++) Minesweeper.State.map[i] = {value: 0, visible: false, flag: false};

	var table = context.getElementsByTagName('table')[0];
	table.innerHTML = "";
	
	for(let y = 0; y < size.height; y++) {
		var row = document.createElement('tr');

		for(let x = 0; x < size.width; x++) {
			var button = document.createElement('input');
			button.setAttribute('type', 'submit');
			button.setAttribute('class', 'c'+x+' r'+y);
			renderCell(Minesweeper.State.map[y*size.width + x], button);

			button.onclick       = function(e) {e.preventDefault(); handleButton(e, x, y)};
			button.ondblclick    = function(e) {e.preventDefault(); handleDouble(e, x, y)};
			button.oncontextmenu = function(e) {e.preventDefault(); handleFlag(e, x, y)};

			var cell = document.createElement('td');
			cell.appendChild(button);
			row.appendChild(cell);
		}

		table.appendChild(row);
	}

	Minesweeper.loop();
}

let leftpad = function(text, padding, length) {
	let output = text + "";
	while(output.length < length) output = padding + output;
	return output;
}

let handleFlag = function(e, x, y) {
	if(Minesweeper.State.state == "pause" || Minesweeper.State.state == "over") return;

	let cell = Minesweeper.State.map[x+y*size.width];
	if(!cell.visible) {
		cell.flag = !cell.flag;
		Minesweeper.State.bombs += cell.flag ? -1 : 1;
		renderCell(cell, e.target);
	}
}

let handleDouble = function(e, x, y) {
	if(Minesweeper.State.state == "pause" || Minesweeper.State.state == "over") return;

	let cell = Minesweeper.State.map[x+y*size.width];
	if(cell.visible) {
		// Count flags
		let flags = 0;
		let position = x + y*size.width;
		for(let dy = -1; dy <= 1; dy++) {
			for(let dx = -1; dx <= 1; dx++) {
				let neighbour = position + dx + dy*size.width;
				if(neighbour >= 0 && neighbour < size.total && (position % size.width) + dx >= 0 && (position % size.width) + dx < size.width && Minesweeper.State.map[neighbour].flag) {
					flags++;
				}
			}
		}

		if(cell.value == flags) {
			for(let dy = -1; dy <= 1; dy++) {
				for(let dx = -1; dx <= 1; dx++) {
					let neighbour = position + dx + dy*size.width;
					if(neighbour >= 0 && neighbour < size.total && (position % size.width) + dx >= 0 && (position % size.width) + dx < size.width && !Minesweeper.State.map[neighbour].flag) {
						let neighbourcell = Minesweeper.State.map[neighbour];

						if(neighbourcell.value == -1) {
							/* Gameover */
							Minesweeper.State.state = "over";
							document.getElementById("minesweeper-face").innerHTML = "😵";

							for(let i = 0; i < size.total; i++) {
								if(Minesweeper.State.map[i].value == -1 && !Minesweeper.State.map[i].visible) {
									Minesweeper.State.map[i].visible = true;
									renderCell(Minesweeper.State.map[i], document.querySelector(".r{0}.c{1}".format(~~(i/size.width), i%size.width)));
								}
							}
						}

						neighbourcell.visible = true;
						renderCell(neighbourcell, document.querySelector(".r{0}.c{1}".format(y + dy, x + dx)));
					}
				}
			}
		}
	}
}

let handleButton = function(e, x, y) {
	if(Minesweeper.State.state == "pause") {
		Minesweeper.State.state = "play";

		let limit1 = Minesweeper.State.bombs*2;
		do {
			let limit2 = Minesweeper.State.bombs*2;
			// Setup world
			for(let i = 0; i < size.total; i++) Minesweeper.State.map[i] = {value: 0, visible: false, flag: false};

			// Generate bombs
			for(let i = 0; i < Minesweeper.State.bombs; i++) {
				let position = Math.floor(Math.randomRange(0, Minesweeper.State.map.length));
				if(Minesweeper.State.map[position].value == -1) {
					console.log("collision: " + position);
					if(limit2-- > 0) {
						i--; // Keep looking.
					} else {
						Minesweeper.State.bombs--;
					}
				} else {
					Minesweeper.State.map[position].value = -1;
					// Adjacency
					for(let dy = -1; dy <= 1; dy++) {
						for(let dx = -1; dx <= 1; dx++) {
							if(!(dy == 0 && dx == 0)) {
								let neighbour = position + dx + dy*size.width;
								if(neighbour >= 0 && neighbour < size.total && (position % size.width) + dx >= 0 && (position % size.width) + dx < size.width && Minesweeper.State.map[neighbour].value >= 0) {
									Minesweeper.State.map[neighbour].value++;
								}
							}
						}
					}
				}
			}
		} while(Minesweeper.State.map[x+y*size.width].value != 0 && limit1-- > 0);
	}
	if(Minesweeper.State.state == "over") return;

	console.log("done");

	let cell = Minesweeper.State.map[x+y*size.width];

	if(cell.flag || cell.visible) {
		/* Do nothing */
		return;
	} else {
		cell.visible = true;

		if(cell.value == -1) {
			/* Gameover */
			Minesweeper.State.state = "over";
			document.getElementById("minesweeper-face").innerHTML = "😵";

			for(let i = 0; i < size.total; i++) {
				if(Minesweeper.State.map[i].value == -1 && !Minesweeper.State.map[i].visible) {
					Minesweeper.State.map[i].visible = true;
					renderCell(Minesweeper.State.map[i], document.querySelector(".r{0}.c{1}".format(~~(i/size.width), i%size.width)));
				}
			}
		}
		if(cell.value == 0) {
			/* Expand */
			let queue = [];
			queue.push({x:x,y:y});

			// Breadth first search
			while(queue.length > 0) {
				let child = queue.pop();
				let childcell = Minesweeper.State.map[child.x+child.y*size.width];

				childcell.visible = true;
				renderCell(childcell, document.querySelector(".r{0}.c{1}".format(child.y, child.x)));

				if(childcell.value == 0) {
					for(let dy = -1; dy <= 1; dy++) {
						for(let dx = -1; dx <= 1; dx++) {
							if(dx == 0 && dy == 0) continue;
							if(child.x+dx >= 0 && child.x+dx < size.width && child.y+dy >= 0 && child.y+dy < size.height && !Minesweeper.State.map[child.x+dx+(child.y+dy)*size.width].visible) queue.push({x:child.x+dx,y:child.y+dy});
						}
					}
				}
			}
		}

		/* Check victory */
		let won = true;
		for(let i = 0; i < Minesweeper.State.map.length; i++) {
			if(Minesweeper.State.map[i].value != -1 && !Minesweeper.State.map[i].visible) {
				won = false;
				break;
			}
		}
		if(won) {
			Minesweeper.State.state = "won";
			document.getElementById("minesweeper-face").innerHTML = "😁";
		}

		renderCell(cell, e.target);
	}
}

let renderCell = function(cell, target) {
	if(cell.flag) {
		target.setAttribute('value', '⚑');
	} else if(cell.visible) {
		if(cell.value == -1) {
			target.setAttribute('value', '✸');
		} else {
			target.setAttribute('value', cell.value);
		}
	} else {
		target.setAttribute('value', '-');
	}
}

Minesweeper.events = function(state, res) {

}

/* Game update logic */
Minesweeper.logic = function(state, res) {
	if(state.state == "play") state.time += delta/1000;
}

/* Renderer */
Minesweeper.render = function(state, res) {
	document.getElementById('minesweeper-time').innerHTML  = leftpad(Math.floor(state.time), "0", 3);
	document.getElementById('minesweeper-bombs').innerHTML = leftpad(state.bombs, "0", 3);
}

/* Gameloop */
Minesweeper.loop = function() {
	let now = window.performance.now();
	delta = now - time;
	time = now;

	Minesweeper.events(Minesweeper.State, Minesweeper.Resources);
	if (running) Minesweeper.logic(Minesweeper.State, Minesweeper.Resources);
	Minesweeper.render(Minesweeper.State, Minesweeper.Resources);

	requestAnimationFrame(Minesweeper.loop);
}

/* Start */
// addEventListener("load", function(){if(typeof Loader !== "undefined") Loader.register(Minesweeper);});
window.addEventListener("load", Minesweeper.init, false);