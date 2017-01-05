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
		state: "pause",
		running: true,
		size: {scale: 1, width: 8, height: 8, total: 8 * 8}
	},
	Resources: {},
	Entities: {}
};

/* Initialization */
Minesweeper.init = function(context) {
	context.innerHTML = '<div id="canvas-minesweeper">\
		<div>\
			<div>\
				<span id="minesweeper-bombs">000</span>\
				<button id="minesweeper-face">😊</button>\
				<span id="minesweeper-time">000</span>\
			</div>\
			<table></table>\
		</div>\
	</div>';
	Minesweeper.Context = document.getElementById('canvas-minesweeper');

	let resizefunc = function() {
		if(window.innerWidth*Minesweeper.State.size.height/Minesweeper.State.size.width < (window.innerHeight-64)) {
			Minesweeper.Context.style.width  = window.innerWidth + "px";
			Minesweeper.Context.style.height = window.innerWidth*Minesweeper.State.size.height/Minesweeper.State.size.width + "px";
		} else {
			Minesweeper.Context.style.width  = (window.innerHeight-64)*Minesweeper.State.size.width/Minesweeper.State.size.height + "px";
			Minesweeper.Context.style.height = (window.innerHeight-64) + "px";
		}
	};
	window.addEventListener("resize", resizefunc);
	resizefunc();

	Minesweeper.State.state = "pause";
	Minesweeper.State.time = 0;
	Minesweeper.State.bombs = 16;
	document.getElementById("minesweeper-face").innerHTML = "😊";
	document.getElementById("minesweeper-face").onclick = Minesweeper.init;

	// Setup world
	for(let i = 0; i < Minesweeper.State.size.total; i++) Minesweeper.State.map[i] = {value: 0, visible: false, flag: false};

	var table = Minesweeper.Context.getElementsByTagName('table')[0];
	table.innerHTML = "";
	
	for(let y = 0; y < Minesweeper.State.size.height; y++) {
		var row = document.createElement('tr');

		for(let x = 0; x < Minesweeper.State.size.width; x++) {
			var button = document.createElement('input');
			button.setAttribute('type', 'submit');
			button.setAttribute('class', 'c'+x+' r'+y);
			renderCell(Minesweeper.State.map[y*Minesweeper.State.size.width + x], button);

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

let handleFlag = function(e, x, y) {
	if(Minesweeper.State.state == "pause" || Minesweeper.State.state == "over") return;

	let cell = Minesweeper.State.map[x+y*Minesweeper.State.size.width];
	if(!cell.visible) {
		cell.flag = !cell.flag;
		Minesweeper.State.bombs += cell.flag ? -1 : 1;
		renderCell(cell, e.target);
	}
}

let handleDouble = function(e, x, y) {
	if(Minesweeper.State.state == "pause" || Minesweeper.State.state == "over") return;

	let cell = Minesweeper.State.map[x+y*Minesweeper.State.size.width];
	if(cell.visible) {
		// Count flags
		let flags = 0;
		let position = x + y*Minesweeper.State.size.width;
		for(let dy = -1; dy <= 1; dy++) {
			for(let dx = -1; dx <= 1; dx++) {
				let neighbour = position + dx + dy*Minesweeper.State.size.width;
				if(neighbour >= 0 && neighbour < Minesweeper.State.size.total && (position % Minesweeper.State.size.width) + dx >= 0 && (position % Minesweeper.State.size.width) + dx < Minesweeper.State.size.width && Minesweeper.State.map[neighbour].flag) {
					flags++;
				}
			}
		}

		if(cell.value == flags) {
			for(let dy = -1; dy <= 1; dy++) {
				for(let dx = -1; dx <= 1; dx++) {
					let neighbour = position + dx + dy*Minesweeper.State.size.width;
					if(neighbour >= 0 && neighbour < Minesweeper.State.size.total && (position % Minesweeper.State.size.width) + dx >= 0 && (position % Minesweeper.State.size.width) + dx < Minesweeper.State.size.width && !Minesweeper.State.map[neighbour].flag) {
						let neighbourcell = Minesweeper.State.map[neighbour];

						if(neighbourcell.value == -1) {
							/* Gameover */
							Minesweeper.State.state = "over";
							document.getElementById("minesweeper-face").innerHTML = "😵";

							for(let i = 0; i < Minesweeper.State.size.total; i++) {
								if(Minesweeper.State.map[i].value == -1 && !Minesweeper.State.map[i].visible) {
									Minesweeper.State.map[i].visible = true;
									renderCell(Minesweeper.State.map[i], document.querySelector(".r{0}.c{1}".format(~~(i/Minesweeper.State.size.width), i%Minesweeper.State.size.width)));
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
			for(let i = 0; i < Minesweeper.State.size.total; i++) Minesweeper.State.map[i] = {value: 0, visible: false, flag: false};

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
								let neighbour = position + dx + dy*Minesweeper.State.size.width;
								if(neighbour >= 0 && neighbour < Minesweeper.State.size.total && (position % Minesweeper.State.size.width) + dx >= 0 && (position % Minesweeper.State.size.width) + dx < Minesweeper.State.size.width && Minesweeper.State.map[neighbour].value >= 0) {
									Minesweeper.State.map[neighbour].value++;
								}
							}
						}
					}
				}
			}
		} while(Minesweeper.State.map[x+y*Minesweeper.State.size.width].value != 0 && limit1-- > 0);
	}
	if(Minesweeper.State.state == "over") return;

	console.log("done");

	let cell = Minesweeper.State.map[x+y*Minesweeper.State.size.width];

	if(cell.flag || cell.visible) {
		/* Do nothing */
		return;
	} else {
		cell.visible = true;

		if(cell.value == -1) {
			/* Gameover */
			Minesweeper.State.state = "over";
			document.getElementById("minesweeper-face").innerHTML = "😵";

			for(let i = 0; i < Minesweeper.State.size.total; i++) {
				if(Minesweeper.State.map[i].value == -1 && !Minesweeper.State.map[i].visible) {
					Minesweeper.State.map[i].visible = true;
					renderCell(Minesweeper.State.map[i], document.querySelector(".r{0}.c{1}".format(~~(i/Minesweeper.State.size.width), i%Minesweeper.State.size.width)));
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
				let childcell = Minesweeper.State.map[child.x+child.y*Minesweeper.State.size.width];

				childcell.visible = true;
				renderCell(childcell, document.querySelector(".r{0}.c{1}".format(child.y, child.x)));

				if(childcell.value == 0) {
					for(let dy = -1; dy <= 1; dy++) {
						for(let dx = -1; dx <= 1; dx++) {
							if(dx == 0 && dy == 0) continue;
							if(child.x+dx >= 0 && child.x+dx < Minesweeper.State.size.width && child.y+dy >= 0 && child.y+dy < Minesweeper.State.size.height && !Minesweeper.State.map[child.x+dx+(child.y+dy)*Minesweeper.State.size.width].visible) queue.push({x:child.x+dx,y:child.y+dy});
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

Minesweeper.events = function(state, context, res) {

}

/* Game update logic */
Minesweeper.logic = function(state, context, res) {
	if(state.state == "play") state.time += Timing.delta/1000;
}

/* Renderer */
Minesweeper.render = function(state, context, res) {
	document.getElementById('minesweeper-time').innerHTML  = (Math.floor(state.time)+"").leftpad("0", 3);
	document.getElementById('minesweeper-bombs').innerHTML = (state.bombs+"").leftpad("0", 3);
}

/* Gameloop */
Minesweeper.loop = function() {
	Timing.refresh();

	if(Minesweeper.State.running) {
		Minesweeper.events(Minesweeper.State, Minesweeper.Context, Minesweeper.Resources);
		Minesweeper.logic(Minesweeper.State, Minesweeper.Context, Minesweeper.Resources);
		Minesweeper.render(Minesweeper.State, Minesweeper.Context, Minesweeper.Resources);
	}

	requestAnimationFrame(Minesweeper.loop);
}

/* Start */
addEventListener("load", function(){if(typeof Loader !== "undefined") Loader.register(Minesweeper);});
