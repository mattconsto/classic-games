var Asteroids = {
	Info: {
		name: "Asteroids",
		path: "asteroids",
		description: "Classic Asteroids. Use WASD to fly your spaceship, and SPACE to fire a shot. Destroy all asteroids before they destroy you!"
	},
	Context: {},
	State: {},
	Resources: {
		blip: new Audio('games/asteroids/blip.wav'),
		tone: new Audio('games/asteroids/tone.wav')
	},
	Entities: {}
};

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

		this.v = Math.sign(this.v)*(Math.max(0, Math.abs(this.v) - delta*0.000001));

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
Asteroids.init = function(context) {
	Asteroids.State = {
		size: {scale: 16, width: 512, height: 512, total: 512 * 512},
		score: 0,
		lives: 3,
		ship: {},
		asteroids: [],
		bullets: [],
		debris: [],
		asteroids_count: 7,
		running: true
	};

	context.innerHTML = '<canvas id="canvas">Your browser doesn\'t support HTML5 Canvas!</canvas>';
	Asteroids.Context = document.getElementById('canvas').getContext('2d');

	let resizefunc = function() {
		console.log("Resize");
		if(window.innerWidth < window.innerHeight-64) {
			Asteroids.Context.canvas.width  = window.innerWidth;
			Asteroids.Context.canvas.height = window.innerWidth;
			Asteroids.State.size.scale = Asteroids.Context.canvas.width/50;
		} else {
			Asteroids.Context.canvas.width  = (window.innerHeight-64)*Asteroids.State.size.height/Asteroids.State.size.width;
			Asteroids.Context.canvas.height = (window.innerHeight-64);
			Asteroids.State.size.scale = Asteroids.Context.canvas.width/50;
		}
	};
	window.addEventListener("resize", resizefunc);
	resizefunc();

	/* Generate asteroids */
	for(let i = 0; i < Asteroids.State.asteroids_count; i++) Asteroids.State.asteroids.push(new Asteroids.Entities.Asteroid(Math.random(), Math.random()));

	Asteroids.State.ship = new Asteroids.Entities.Ship(0.5, 0.5);

	Asteroids.loop();
}

Asteroids.events = function(state, context, res) {
	if(Keyboard.has(87) && !Keyboard.has(83)) {state.ship.v = Math.max(-state.ship.max/2, Math.min(state.ship.max, state.ship.v + Timing.delta*0.000005));} // KeyW
	if(Keyboard.has(83) && !Keyboard.has(87)) {state.ship.v = Math.max(-state.ship.max/2, Math.min(state.ship.max, state.ship.v - Timing.delta*0.000005));} // KeyS

	if(Keyboard.has(65) && !Keyboard.has(68)) {state.ship.a -= Timing.delta*0.01;} // KeyA
	if(Keyboard.has(68) && !Keyboard.has(65)) {state.ship.a += Timing.delta*0.01;} // KeyD

	if(Keyboard.has(32) && state.ship.lastbullet >= 400) {
		console.log("Fire");
		state.ship.lastbullet = 0;
		res.blip.play();
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

				res.tone.play();
				setTimeout(function(){
					res.tone.currentTime = 0;
					res.tone.pause();
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

			res.tone.play();
			setTimeout(function(){
				res.tone.currentTime = 0;
				res.tone.pause();
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
	context.font = "20px Silkscreen";
	context.fillStyle = "#000000";
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);

	context.fillStyle   = "#ffffff";
	context.strokeStyle = "#ffffff";

	context.fillText("Score: " + state.score, 20, 35);
	context.fillText("Lives: " + state.lives, 20, 70);

	[state.asteroids, state.bullets, state.debris, [state.ship]].forEach(function(a) {a.forEach(function(b) {b.render(context);})});
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