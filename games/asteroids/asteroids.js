var Asteroids = {
	Info: {
		name: "Asteroids",
		path: "asteroids",
		description: "Classic Asteroids. Use WASD to fly your spaceship, and SPACE to fire a shot. Destroy all asteroids before they destroy you!"
	},
	Context: {},
	State: {},
	Resources: {
		blip: 'blip.wav',
		tone: 'tone.wav'
	},
	Entities: {}
};

Asteroids.Sign = function(n) {
	if(isNaN(n)) return NaN;
	if(n > 0) return 1;
	if(n < 0) return -1;
	return 0;
}

Asteroids.Entities.Particle = function(x, y, a, v) {
	this.x = x;
	this.y = y;
	this.a = a;
	this.v = v;

	this.alive = true;

	this.logic = function(delta) {
		this.x = (this.x + Math.cos(this.a)*this.v*delta + 1) % 1;
		this.y = (this.y + Math.sin(this.a)*this.v*delta + 1) % 1;
	}
}

Asteroids.Entities.Asteroid = function(x, y, r) {
	this.prototype = new Asteroids.Entities.Particle(); // Nasty, hacky, inheritance which sort of works.
	this.prototype.constructor.call(this, x, y, Math.randomRange(0, 2*Math.PI),Math.randomRange(0.00001, 0.0005));

	this.r = Math.randomRange(0.002, typeof r !== "undefined" ? r/Asteroids.State.size.scale : 0.01)*Asteroids.State.size.scale;

	this.render = function(context) {
		context.beginPath();
		context.arc(this.x*context.canvas.width, this.y*context.canvas.height, this.r*context.canvas.width, 0, 2*Math.PI);
		context.stroke();
	}
}

Asteroids.Entities.Bullet = function(source) {
	this.prototype = new Asteroids.Entities.Particle();
	this.prototype.constructor.call(this, source.x, source.y, source.a, source.max*2);

	this.life = 500;

	this.logic = function(delta, bounds) {
		this.prototype.logic.call(this, delta, bounds);
		if((this.life -= delta) <= 0) this.alive = false;
	}

	this.render = function(context) {
		context.beginPath();
		context.moveTo(this.x*context.canvas.width-Math.cos(this.a)*Asteroids.State.size.scale, this.y*context.canvas.height-Math.sin(this.a)*Asteroids.State.size.scale);
		context.lineTo(this.x*context.canvas.width, this.y*context.canvas.height);
		context.stroke();
	}
}

Asteroids.Entities.Debris = function(source) {
	this.prototype = new Asteroids.Entities.Particle();
	this.prototype.constructor.call(this, source.x, source.y, Math.randomRange(0, 2*Math.PI), Math.randomRange(0.00001, 0.0005));

	this.life = 500;

	this.logic = function(delta, bounds) {
		this.prototype.logic.call(this, delta, bounds);
		if((this.life -= delta) <= 0) this.alive = false;
	}

	this.render = function(context) {
		context.beginPath();
		context.moveTo(this.x*context.canvas.width-Math.cos(this.a)*Asteroids.State.size.scale/2, this.y*context.canvas.height-Math.sin(this.a)*Asteroids.State.size.scale/2);
		context.lineTo(this.x*context.canvas.width, this.y*context.canvas.height);
		context.stroke();
	}
}

Asteroids.Entities.Ship = function(x, y) {
	this.prototype = new Asteroids.Entities.Particle();
	this.prototype.constructor.call(this, x, y, 0, 0);

	this.max = 0.001;
	this.lastbullet = 1000;
	this.invicible  = 1000;

	this.logic = function(delta, bounds) {
		this.prototype.logic.call(this, delta, bounds);

		this.v = Asteroids.Sign(this.v)*(Math.max(0, Math.abs(this.v) - delta*0.000001));

		this.lastbullet = Math.min(1000, this.lastbullet + delta);
		this.invicible  = Math.max(0, this.invicible - delta);
	}

	this.render = function(context) {
		if(this.invicible <= 0 || (Timing.stamp % 200) > 100) {
			context.translate(this.x*context.canvas.width, this.y*context.canvas.height);
			context.rotate(this.a+Math.PI/2);
			context.beginPath();
			context.moveTo(0,-2*Asteroids.State.size.scale);
			context.lineTo(1*Asteroids.State.size.scale,1*Asteroids.State.size.scale);
			context.lineTo(0,0);
			context.lineTo(-1*Asteroids.State.size.scale,1*Asteroids.State.size.scale);
			context.lineTo(0,-2*Asteroids.State.size.scale);
			context.stroke();
			context.setTransform(1,0,0,1,0,0);
		}
	}
}

/* Initialization */
Asteroids.init = function(context, path) {
	Asteroids.State = {
		asteroids: [],
		asteroids_count: 7,
		bullets: [],
		debris: [],
		dragging: false,
		lives: 3,
		running: true,
		score: 0,
		ship: {},
		size: {scale: 16, width: 512, height: 512, total: 512 * 512},
		touching: false,
	};

	Asteroids.Resources = Resources.load(Asteroids.Resources, path ? path : 'games/asteroids/');

	context.innerHTML = '<canvas id="canvas">Your browser doesn\'t support HTML5 Canvas!</canvas>';
	Asteroids.Context = document.getElementById('canvas').getContext('2d');

	let resizefunc = function() {
		if(Asteroids.Context.canvas.parentElement.clientWidth < Asteroids.Context.canvas.parentElement.clientHeight) {
			Asteroids.Context.canvas.width  = Asteroids.Context.canvas.parentElement.clientWidth;
			Asteroids.Context.canvas.height = Asteroids.Context.canvas.parentElement.clientWidth;
		} else {
			Asteroids.Context.canvas.width  = Asteroids.Context.canvas.parentElement.clientHeight*Asteroids.State.size.height/Asteroids.State.size.width;
			Asteroids.Context.canvas.height = Asteroids.Context.canvas.parentElement.clientHeight;
		}
		Asteroids.State.size.scale = Asteroids.Context.canvas.width/50;
	};
	window.addEventListener("resize", resizefunc);
	resizefunc();

	Asteroids.State.movementTimer = setInterval(function() {
		if(Asteroids.State.dragging || Asteroids.State.touching !== false) {
			Keyboard.add(32);
			if(Asteroids.State.moveX == -1) {
				Keyboard.delete(39);
				Keyboard.add(37);
			} else if(Asteroids.State.moveX == 0) {
				if(Asteroids.State.moveY >= 0) {
					Keyboard.delete(37);
					Keyboard.delete(38);
					Keyboard.delete(40);
					Keyboard.add(38);
				} else {
					Keyboard.delete(37);
					Keyboard.delete(38);
					Keyboard.delete(39);
					Keyboard.add(40);
				}
			} else if (Asteroids.State.moveX == 1) {
				Keyboard.delete(37);
				Keyboard.add(39);
			}
		}
	}, 250);

	Asteroids.Context.canvas.addEventListener("mousedown", function(e) {
		if(Asteroids.State.touching !== false) return;

		e.stopPropagation();

		Asteroids.State.dragging = true;
		Asteroids.State.moveX = Asteroids.Sign(Math.round(4 * e.offsetX / e.target.clientWidth) - 2);
		Asteroids.State.moveY = Asteroids.Sign(Math.round(4 * e.offsetY / e.target.clientHeight) - 2);
	});

	Asteroids.Context.canvas.addEventListener("mousemove", function(e) {
		if(Asteroids.State.touching !== false) return;

		e.stopPropagation();

		if(Asteroids.State.dragging) {
			Asteroids.State.moveX = Asteroids.Sign(Math.round(4 * e.offsetX / e.target.clientWidth) - 2);
			Asteroids.State.moveY = Asteroids.Sign(Math.round(4 * e.offsetY / e.target.clientHeight) - 2);
		}
	});

	Asteroids.Context.canvas.addEventListener("mouseup", function(e) {
		if(Asteroids.State.touching !== false) return;

		e.stopPropagation();

		Asteroids.State.dragging = false;
		Keyboard.delete(32);
		Keyboard.delete(37);
		Keyboard.delete(38);
		Keyboard.delete(39);
		Keyboard.delete(40);
	});

	Asteroids.Context.canvas.addEventListener("touchstart", function(e) {
		if(Asteroids.State.dragging) return;

		e.stopPropagation();

		Asteroids.State.touching = e.changedTouches[0].identifier;
		var rect = e.changedTouches[0].target.getBoundingClientRect();
		Asteroids.State.moveX = Asteroids.Sign(Math.round(4 * (e.changedTouches[0].clientX - rect.left) / e.target.clientWidth) - 2);
		Asteroids.State.moveY = Asteroids.Sign(Math.round(4 * (e.changedTouches[0].clientY - rect.top) / e.target.clientHeight) - 2);
	});

	Asteroids.Context.canvas.addEventListener("touchmove", function(e) {
		if(Asteroids.State.dragging) return;

		e.stopPropagation();

		for (var i = 0; i < e.changedTouches.length; i++) {
			if(Asteroids.State.touching == e.changedTouches[i].identifier) {
				var rect = e.changedTouches[i].target.getBoundingClientRect();
				Asteroids.State.moveX = Asteroids.Sign(Math.round(4 * (e.changedTouches[i].clientX - rect.left) / e.target.clientWidth) - 2);
				Asteroids.State.moveY = Asteroids.Sign(Math.round(4 * (e.changedTouches[i].clientY - rect.top) / e.target.clientHeight) - 2);
				break;
			}
		}
	});

	Asteroids.Context.canvas.addEventListener("touchend", function(e) {
		if(Asteroids.State.dragging) return;

		e.stopPropagation();

		for (var i = 0; i < e.changedTouches.length; i++) {
			if(Asteroids.State.touching == e.changedTouches[i].identifier) {
				Asteroids.State.touching = false;
				Keyboard.delete(32);
				Keyboard.delete(37);
				Keyboard.delete(38);
				Keyboard.delete(39);
				Keyboard.delete(40);
				break;
			}
		}
	});

	/* Generate asteroids */
	for(let i = 0; i < Asteroids.State.asteroids_count; i++) {
		Asteroids.State.asteroids.push(
			new Asteroids.Entities.Asteroid(Math.random(), Math.random())
		);
	}

	Asteroids.State.ship = new Asteroids.Entities.Ship(0.5, 0.5);

	Asteroids.loop();
}

Asteroids.events = function(state, context, res) {
	if( // KeyW
		(Keyboard.has(87) && !Keyboard.has(83)) ||
		(Keyboard.has(38) && !Keyboard.has(40))
	) {
		state.ship.v = Math.max(
			-state.ship.max/2,
			Math.min(state.ship.max, state.ship.v + Timing.delta*0.000005)
		);
	}

	if( // KeyS
		(Keyboard.has(83) && !Keyboard.has(87)) ||
		(Keyboard.has(40) && !Keyboard.has(38))
	) {
		state.ship.v = Math.max(
			-state.ship.max/2,
			Math.min(state.ship.max, state.ship.v - Timing.delta*0.000005)
		);
	}

	if( // KeyA
		(Keyboard.has(65) && !Keyboard.has(68)) ||
		(Keyboard.has(37) && !Keyboard.has(39))
	) {
		state.ship.a -= Timing.delta*0.01;
	}

	if( // KeyD
		(Keyboard.has(68) && !Keyboard.has(65)) ||
		(Keyboard.has(39) && !Keyboard.has(37))
	) {
		state.ship.a += Timing.delta*0.01;
	}

	if(
		Keyboard.has(32) && state.ship.lastbullet >= 400
	) {
		state.ship.lastbullet = 0;
		try {
			res.blip.play();
		} catch(ignored) {}
		state.bullets.push(new Asteroids.Entities.Bullet(state.ship));
	}
}

/* Game update logic */
Asteroids.logic = function(state, context, res) {
	// Update state
	[state.asteroids, state.bullets, state.debris, [state.ship]].forEach(function(object) {
		for(let i = object.length-1; i >= 0; i--) {
			object[i].logic(Timing.delta, Asteroids.State.size);
			if(!object[i].alive) object.splice(i, 1);
		}
	});

	/* Collisions */
	for(let a = state.asteroids.length-1; a >= 0; a--) {
		for(let b = state.bullets.length-1; b >= 0; b--) {
			if(Math.pow(state.asteroids[a].x - state.bullets[b].x, 2) + Math.pow(state.asteroids[a].y - state.bullets[b].y, 2) < Math.pow(state.asteroids[a].r, 2)) {
				if(state.asteroids[a].r/Asteroids.State.size.scale > 0.005)
					for(let i = 0; i < Math.round(Math.randomRange(0, 3)); i++)
						Asteroids.State.asteroids.push(new Asteroids.Entities.Asteroid(state.asteroids[a].x, state.asteroids[a].y, state.asteroids[a].r/2));

				for(let i = 0; i < Math.round(Math.randomRange(5, 15)); i++)
					state.debris.push(new Asteroids.Entities.Debris(state.asteroids[a]));
				state.score += 1;
				state.asteroids.splice(a, 1);

				try {
					if(res.tone && res.tone.play) res.tone.play();
				} catch(ignored) {}
				setTimeout(function(){
					try {
						if(res.tone) res.tone.currentTime = 0;
						if(res.tone && res.tone.pause) res.tone.pause();
					} catch(ignored) {}
					Asteroids.State.running = true;
				}, 200);
				return;
			}
		}
	}

	for(let a = state.asteroids.length-1; a >= 0; a--) {
		if(state.ship.invicible <= 0 && Math.pow(state.asteroids[a].x - state.ship.x, 2) + Math.pow(state.asteroids[a].y - state.ship.y, 2) < Math.pow(state.asteroids[a].r, 2)) {
			state.lives -= 1;

			if(state.lives <= 0) {
				/* Reset when dead */
				state.lives = 3;
				state.score = 0;
				state.asteroids_count = 7;
				state.asteroids = [];
				/* Generate asteroids */
				for(let i = 0; i < state.asteroids_count; i++) Asteroids.State.asteroids.push(new Asteroids.Entities.Asteroid(Math.random(), Math.random()));
			}

			Asteroids.State.running = false;
			state.ship = new Asteroids.Entities.Ship(0.5, 0.5);

			try {
				if(res.tone && res.tone.play) res.tone.play();
			} catch(ignored) {}
			setTimeout(function(){
				try {
					if(res.tone) res.tone.currentTime = 0;
					if(res.tone && res.tone.pause) res.tone.pause();
				} catch(ignored) {}
				Asteroids.State.running = true;
			}, 1000);

			return;
		}
	}

	if(state.asteroids.length <= 0) {
		state.asteroids_count += 1;
		for(let i = 0; i < state.asteroids_count; i++) Asteroids.State.asteroids.push(new Asteroids.Entities.Asteroid(Math.random(), Math.random()));
		state.ship.invicible += 500;
	}
}

/* Renderer */
Asteroids.render = function(state, context, res) {
	var font_size = Math.min(20, Math.max(5, Math.round(2 * Asteroids.State.size.scale)));
	context.font = font_size + "px Silkscreen";
	context.fillStyle = "#000000";
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);

	context.fillStyle   = "#ffffff";
	context.strokeStyle = "#ffffff";

	context.fillText("Score: " + state.score, font_size, 2 * font_size);
	context.fillText("Lives: " + state.lives, font_size, 4 * font_size);

	[state.asteroids, state.bullets, state.debris, [state.ship]].forEach(function(a) {a.forEach(function(b) {b.render(context);})});

	context.strokeRect(0, 0, context.canvas.width - 1, context.canvas.height - 1);
}

/* Gameloop */

Asteroids.loop = function() {
	Timing.refresh();

	if(Asteroids.State.running) {
		Asteroids.events(Asteroids.State, Asteroids.Context, Asteroids.Resources);
		Asteroids.logic(Asteroids.State, Asteroids.Context, Asteroids.Resources);
	}
	Asteroids.render(Asteroids.State, Asteroids.Context, Asteroids.Resources);

	requestAnimationFrame(Asteroids.loop);
}

/* Start */
addEventListener("load", function(){if(typeof Loader !== "undefined") Loader.register(Asteroids);});
