var Pong = {
	Info: {
		name: "Pong",
		path: "pong",
		description: "Classic Pong!"
	},
	Context: {},
	State: {
		running: true,
		size: {scale: 1, width: 640, height: 480, total: 640 * 480},
		scale: 6,

		score1: 0,
		score2: 0,
		paddle1: {x: 0.1, y: 0.4, l: 0.2},
		paddle2: {x: 0.9, y: 0.4, l: 0.2},
		ball: {x: 0.5, y: 0.5, v:1, a:(Math.random() > 0.5 ? (Math.random()*Math.PI/2-Math.PI/8) : (Math.random()*Math.PI/2+Math.PI/8*5))},
		ai: false
	},
	Resources: {
		blip: "blip.wav",
		tone: "tone.wav"
	},
	Entities: {}
};

/* Initialization */
Pong.init = function(context, path) {
	context.innerHTML = '<canvas id="canvas">Your browser doesn\'t support HTML5 Canvas!</canvas>';
	Pong.Context = document.getElementById('canvas').getContext('2d');

	Pong.Resources = Resources.load(Pong.Resources, path ? path : 'games/pong/');

	let resizefunc = function() {
		if(Pong.Context.canvas.parentElement.clientWidth*Pong.State.size.height/Pong.State.size.width < Pong.Context.canvas.parentElement.clientHeight) {
			Pong.Context.canvas.width  = Pong.Context.canvas.parentElement.clientWidth;
			Pong.Context.canvas.height = Pong.Context.canvas.parentElement.clientWidth*Pong.State.size.height/Pong.State.size.width;
		} else {
			Pong.Context.canvas.width  = Pong.Context.canvas.parentElement.clientHeight*Pong.State.size.width/Pong.State.size.height;
			Pong.Context.canvas.height = Pong.Context.canvas.parentElement.clientHeight;
		}
		scale = Pong.Context.canvas.width/64;
	};
	window.addEventListener("resize", resizefunc);
	resizefunc();

	let touchfunc = function(e) {
		e.preventDefault();

		for (var i = 0; i < e.changedTouches.length; i++) {
			var rect = e.changedTouches[i].target.getBoundingClientRect();
			var x = Math.sign(Math.round((e.changedTouches[i].clientX - rect.left) / e.target.clientWidth));
			var y = Math.sign(Math.round((e.changedTouches[i].clientY - rect.top) / e.target.clientHeight));
			if(x == 0) {
				Keyboard[y == 0 ? "add" : "delete"](87);
				Keyboard[y == 1 ? "add" : "delete"](83);
			} else if (x == 1) {
				Keyboard[y == 0 ? "add" : "delete"](38);
				Keyboard[y == 1 ? "add" : "delete"](40);
			}
		}
	}

	Pong.Context.canvas.addEventListener("touchstart", touchfunc);
	Pong.Context.canvas.addEventListener("touchmove", touchfunc);
	Pong.Context.canvas.addEventListener("touchend", function(e) {
		e.preventDefault();

		for (var i = 0; i < e.changedTouches.length; i++) {
			var rect = e.changedTouches[i].target.getBoundingClientRect();
			var x = Math.sign(Math.round((e.changedTouches[i].clientX - rect.left) / e.target.clientWidth));
			var y = Math.sign(Math.round((e.changedTouches[i].clientY - rect.top) / e.target.clientHeight));
			if(x == 0) {
				Keyboard.delete(87);
				Keyboard.delete(83);
			} else if (x == 1) {
				Keyboard.delete(38);
				Keyboard.delete(40);
			}
		}
	});

	Pong.loop();
}

Pong.events = function(state, context, res) {
	if(Keyboard.has(87) && !Keyboard.has(83)) state.paddle1.y = Math.limit(state.paddle1.y - Timing.delta*0.002, 0, 1-state.paddle1.l); // KeyW
	if(Keyboard.has(83) && !Keyboard.has(87)) state.paddle1.y = Math.limit(state.paddle1.y + Timing.delta*0.002, 0, 1-state.paddle1.l); // KeyS

	if(!state.ai && Keyboard.has(38) && !Keyboard.has(40)) state.paddle2.y = Math.limit(state.paddle2.y - Timing.delta*0.002, 0, 1-state.paddle2.l); // ArrowUp
	if(!state.ai && Keyboard.has(40) && !Keyboard.has(38)) state.paddle2.y = Math.limit(state.paddle2.y + Timing.delta*0.002, 0, 1-state.paddle2.l); // ArrowDown
}

/* Game update logic */
Pong.logic = function(state, context, res) {
	/* Update positions */
	state.ball.x += Math.cos(state.ball.a)*state.ball.v*Timing.delta*0.0005;
	state.ball.y += Math.sin(state.ball.a)*state.ball.v*Timing.delta*0.0005;

	// paddle1.y = Math.limit(ball.y - paddle1.l/2, scale, size.height-scale-paddle1.l);
	if(state.ai) state.paddle2.y = Math.limit(state.ball.y - state.paddle2.l/2, 0, 1-state.paddle2.l);

	/* Bounce ball of wall */
	if(state.ball.y <= state.scale/context.canvas.height || state.ball.y >= 1 - 2*state.scale/context.canvas.height) {
		state.ball.a = 2*Math.PI - state.ball.a;
		try {
			if(res.blip) res.blip.play();
		} catch(ignored) {}
	}

	/* Bounce ball of paddle, taking into account where the ball hit */
	var direction = (Math.PI + state.ball.a) % Math.PI;

	if(state.ball.a >= 0.5 * Math.PI && state.ball.a <= 1.5 * Math.PI) {
		if (Math.round(state.ball.x*20) == 2 && state.ball.y >= state.paddle1.y && state.ball.y <= state.paddle1.y + state.paddle1.l) {
			state.ball.a = Math.PI - state.ball.a - (state.ball.y - state.paddle1.y - state.paddle1.l/2)/state.paddle1.l*Math.PI/4;
			state.ball.v = Math.min(1.25, state.ball.v + 0.05); //.limitit speed to prevent ball passing through paddle.
			try {
				if(res.blip) res.blip.play();
			} catch(ignored) {}
		}
	} else {
		if(Math.round(state.ball.x*20) == 18 && state.ball.y >= state.paddle2.y && state.ball.y <= state.paddle2.y + state.paddle2.l) {
			state.ball.a = Math.PI - state.ball.a - (state.ball.y - state.paddle2.y - state.paddle1.l/2)/state.paddle2.l*Math.PI/4;
			state.ball.v = Math.min(1.25, state.ball.v + 0.05);
			try {
				if(res.blip) res.blip.play();
			} catch(ignored) {}
		}
	}

	/* A point has been scored, time to reset */
	if(state.ball.x > 1) state.score1 += 1;
	if(state.ball.x < 0) state.score2 += 1;

	if(state.ball.x > 1 || state.ball.x < 0) {
		state.ball = {x: 0.5, y: 0.5, v:1, a:(Math.random() > 0.5 ? (Math.random()*Math.PI/2-Math.PI/8) : (Math.random()*Math.PI/2+Math.PI/8*5))};
		state.running = false;

		try {
			if(res.tone) res.tone.play();
		} catch(ignored) {}
		setTimeout(function(){
			try {
				if(res.tone) res.tone.pause();
				if(res.tone) res.tone.currentTime = 0;
			} catch(ignored) {}
			state.running = true;
		}, 1000);
	}
}

/* Renderer */
Pong.render = function(state, context, res) {
	context.font = 4*scale+"px Silkscreen";
	context.fillStyle = "#000000";
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);

	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, context.canvas.width, state.scale);
	context.fillRect(0, context.canvas.height-state.scale, context.canvas.width, state.scale);

	context.fillRect(state.paddle1.x*context.canvas.width, state.paddle1.y*context.canvas.height, state.scale, state.paddle1.l*context.canvas.height);
	context.fillRect(state.paddle2.x*context.canvas.width, state.paddle2.y*context.canvas.height, state.scale, state.paddle2.l*context.canvas.height);
	context.fillRect(state.ball.x*context.canvas.width, state.ball.y*context.canvas.height, state.scale, state.scale);

	for(let i = 0; i < context.canvas.height/2/state.scale; i++) context.fillRect(context.canvas.width/2, i*2*state.scale, state.scale, state.scale);
	
	context.fillText(state.score1, Math.round(context.canvas.width/4), 10*state.scale);
	context.fillText(state.score2, Math.round(context.canvas.width/4*3), 10*state.scale);
}

/* Gameloop */
Pong.loop = function() {
	Timing.refresh();

	Pong.events(Pong.State, Pong.Context, Pong.Resources);
	if (Pong.State.running) {
		Pong.logic(Pong.State, Pong.Context, Pong.Resources);
		Pong.render(Pong.State, Pong.Context, Pong.Resources);
	}

	requestAnimationFrame(Pong.loop);
}

/* Start */
addEventListener("load", function(){if(typeof Loader !== "undefined") Loader.register(Pong);});
