var FlappyCopter = {
	Info: {
		name: "FlappyCopter",
		path: "flappycopter",
		description: "Classic FlappyCopter!"
	},
	Context: {},
	State: {
		running: true,
		state: "waiting",
		timer: 0,
		size: {scale: 1, width: 8, height: 8, total: 8 * 8},
		ship: {
			x: 0,
			dx: 0.4,
			y: 0.5,
			dy: 0,
			sprite: 0,
		},
		pillars: [{x: 0.5, y: 0.5, h: 0.50}, {x: 1.0, y: 0.5, h: 0.45}, {x: 1.5, y: 0.5, h: 0.40}, {x: 2.0, y: 0.5, h: 0.35}, {x: 2.5, y: 0.5, h: 0.30}],
	},
	Resources: {
		dirt: [
				["groundDirt.png", "groundDirtDown.png"],
				["groundGrass.png", "groundGrassDown.png"],
				["groundIce.png", "groundIceDown.png"],
				["groundSnow.png", "groundSnowDown.png"]
		],
		planes: {
			blue:   ["Planes/planeBlue1.png", "Planes/planeBlue2.png", "Planes/planeBlue3.png"],
			green:  ["Planes/planeGreen1.png", "Planes/planeGreen2.png", "Planes/planeGreen3.png"],
			red:    ["Planes/planeRed1.png", "Planes/planeRed2.png", "Planes/planeRed3.png"],
			yellow: ["Planes/planeYellow1.png", "Planes/planeYellow2.png", "Planes/planeYellow3.png"]
		},
		letters: ["Letters/A.png", "Letters/B.png", "Letters/C.png", "Letters/D.png", "Letters/E.png", "Letters/F.png", "Letters/G.png", "Letters/H.png", "Letters/I.png", "Letters/J.png", "Letters/K.png", "Letters/L.png", "Letters/M.png", "Letters/N.png", "Letters/O.png", "Letters/P.png", "Letters/Q.png", "Letters/R.png", "Letters/S.png", "Letters/T.png", "Letters/U.png", "Letters/V.png", "Letters/W.png", "Letters/X.png", "Letters/Y.png", "Letters/Z.png"],
		numbers: ["Letters/0.png", "Letters/1.png", "Letters/2.png", "Letters/3.png", "Letters/4.png", "Letters/5.png", "Letters/6.png", "Letters/7.png", "Letters/8.png", "Letters/9.png"],
		puffs: ["puffSmall.png", "puffLarge.png"],
		rocks: [
				["rock.png", "rockDown.png"],
				["rockGrass.png", "rockGrassDown.png"],
				["rockIce.png", "rockIceDown.png"],
				["rockSnow.png", "rockSnowDown.png"]
		],
		stars: ["starBronze.png", "starSilver.png", "starGold.png"],
		background: "background.png"
	},
	Entities: {}
};

/* Initialization */
FlappyCopter.init = function(context, path) {
	context.innerHTML = '<canvas id="canvas">Your browser doesn\'t support HTML5 Canvas!</canvas>';
	FlappyCopter.Context = document.getElementById('canvas').getContext('2d');

	FlappyCopter.Resources = Resources.load(FlappyCopter.Resources, path ? path : 'games/flappycopter/');

	let resizefunc = function() {
		FlappyCopter.Context.canvas.width  = FlappyCopter.Context.canvas.parentElement.clientWidth;
		FlappyCopter.Context.canvas.height = FlappyCopter.Context.canvas.parentElement.clientHeight;
	};
	window.addEventListener("resize", resizefunc);
	resizefunc();

	FlappyCopter.Context.canvas.addEventListener("mousedown", FlappyCopter.Jump);
	FlappyCopter.Context.canvas.addEventListener("touchstart", FlappyCopter.Jump);

	FlappyCopter.loop();
}

FlappyCopter.events = function(state, context, res) {
	if(Keyboard.delete(32)) FlappyCopter.Jump();
}

FlappyCopter.Jump = function() {
	console.log('jump');
	FlappyCopter.State.state = "flying";
	FlappyCopter.State.ship.dy = Math.min(1, FlappyCopter.State.ship.dy + 10000);
}

/* Game update logic */
FlappyCopter.logic = function(state, context, res) {
	if(state.state != "waiting" && state.timer > 500) {
		state.ship.x += state.ship.dx*Timing.delta/1000;
		state.ship.y = state.ship.y + state.ship.dy*Timing.delta/1000;
		state.ship.dy = state.ship.dy - Timing.delta/400;
		state.ship.sprite = (state.ship.sprite + Timing.delta/48) % res.planes.blue.length;
	}

	// Collision with ceiling/floor
	if(state.ship.y > 1 || state.ship.y < 0.075) {
		state.state = "waiting";
		state.timer = 0;
		state.ship.x = 0;
		state.ship.y = 0.5;
		state.pillars = [{x: 0.5, y: 0.5, h: 0.50}, {x: 0.5, y: 0.5, h: 0.45}, {x: 0.5, y: 0.5, h: 0.40}, {x: 0.5, y: 0.5, h: 0.35}, {x: 0.5, y: 0.5, h: 0.30}];
	}

	// Collision with pillars
	for(let i = 0; i < state.pillars.length; i++) {
		if(Math.abs(state.ship.x + 0.075/2 - state.pillars[i].x) < 0.075 && Math.abs(state.ship.y + 0.075/2 - state.pillars[i].y) > state.pillars[i].h/1.5) {
			state.state = "waiting";
			state.timer = 0;
			state.ship.x = 0;
			state.ship.y = 0.5;
			state.pillars = [{x: 0.5, y: 0.5, h: 0.50}, {x: 0.5, y: 0.5, h: 0.45}, {x: 0.5, y: 0.5, h: 0.40}, {x: 0.5, y: 0.5, h: 0.35}, {x: 0.5, y: 0.5, h: 0.30}];
		}
	}

	// New pillars
	while(state.pillars.length < 20) {
		state.pillars.push({x: state.pillars[state.pillars.length-1].x + Math.randomRange(0.4, 0.8), y: Math.randomRange(0.15, 0.85), h: Math.randomRange(0.2, 0.4)});
	}

	// Cull pillars
	for(let i = state.pillars.length-1; i >= 0; i--) {
		if(state.pillars.length > 1 && state.ship.x - state.pillars[i].x > 1) state.pillars.splice(i, 1);
	}

	state.timer += Timing.delta;
}

/* Renderer */
FlappyCopter.render = function(state, context, res) {
	let backgroundOffset = Math.ceil(state.ship.x/4)*context.canvas.height/res.background.height*res.background.width;
	for(let i = -1; i <= Math.ceil(context.canvas.width/context.canvas.height); i++) {
		context.drawImage(res.background, backgroundOffset-state.ship.x*context.canvas.height/res.background.height*res.background.width/4+i*context.canvas.height/res.background.height*res.background.width, 0, context.canvas.height/res.background.height*res.background.width, context.canvas.height);
	}

	// Dirts
	let dirtHeight = context.canvas.height*0.15;
	let dirtWidth = dirtHeight/res.dirt[0][1].height*res.dirt[0][1].width;
	let dirtOffset = Math.ceil((state.ship.x/2*context.canvas.width)/dirtWidth)*dirtWidth;
	context.globalAlpha = 0.75;
	for(let i = -1; i <= Math.ceil(context.canvas.width/context.canvas.height); i++) {
		context.drawImage(res.dirt[0][1], dirtOffset-state.ship.x/2*context.canvas.width+i*dirtWidth, 0, dirtWidth, dirtHeight);
		context.drawImage(res.dirt[0][0], dirtOffset-state.ship.x/2*context.canvas.width+i*dirtWidth, context.canvas.height-dirtHeight, dirtWidth, dirtHeight);
	}
	context.globalAlpha = 1.0;

	// Pillars
	for(pillar in state.pillars) {
		context.drawImage(res.rocks[0][1],
			(state.pillars[pillar].x - state.ship.x)*context.canvas.height,
			0-(state.pillars[pillar].y+state.pillars[pillar].h/2)*context.canvas.height+context.canvas.height*(1-0.8),
			context.canvas.height*0.8/res.rocks[0][1].height*res.rocks[0][1].width,
			context.canvas.height*0.8);
		context.drawImage(res.rocks[0][0],
			(state.pillars[pillar].x - state.ship.x)*context.canvas.height,
			context.canvas.height-(state.pillars[pillar].y-state.pillars[pillar].h/2)*context.canvas.height,
			context.canvas.height*0.8/res.rocks[0][0].height*res.rocks[0][0].width,
			context.canvas.height*0.8);
	}

	// Ship
	context.drawImage(res.planes.blue[Math.floor(state.ship.sprite)], context.canvas.height/4, (1-state.ship.y)*context.canvas.height, context.canvas.height*0.075/res.planes.blue[Math.floor(state.ship.sprite)].height*res.planes.blue[Math.floor(state.ship.sprite)].width, context.canvas.height*0.075);

	// Score
	context.font = "20px Arial";
	context.fillStyle = "#000000";

	// Text
	let string = (state.ship.x*10).toFixed(0) + " meters";
	let stringOffset = 64;
	for(let i = 0; i < string.length; i++) {
		let code = string.toUpperCase().charCodeAt(i);
		if(code >= 48 && code <= 57) {
			let width = 32/res.numbers[code-48].height*res.numbers[code-48].width;
			context.drawImage(res.numbers[code-48], stringOffset, 64, width, 32);
			stringOffset += 25 + 5;
		} else if(code >= 65 && code <= 90) {
			let width = 32/res.letters[code-65].height*res.letters[code-65].width;
			context.drawImage(res.letters[code-65], stringOffset, 64, width, 32);
			stringOffset += width + 5;
		} else {
			stringOffset += 15;
		}
	}

}

/* Gameloop */
FlappyCopter.loop = function() {
	Timing.refresh();

	if(FlappyCopter.State.running) {
		FlappyCopter.events(FlappyCopter.State, FlappyCopter.Context, FlappyCopter.Resources);
		FlappyCopter.logic(FlappyCopter.State, FlappyCopter.Context, FlappyCopter.Resources);
		FlappyCopter.render(FlappyCopter.State, FlappyCopter.Context, FlappyCopter.Resources);
	}

	requestAnimationFrame(FlappyCopter.loop);
}

/* Start */
addEventListener("load", function(){if(typeof Loader !== "undefined") Loader.register(FlappyCopter);});
