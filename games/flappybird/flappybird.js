var FlappyBird = {
	Info: {
		name: "Flappy Bird",
		path: "flappybird",
		description: "Classic FlappyBird!"
	},
	Context: {},
	State: {
		running: true,
		size: {scale: 1, width: 8, height: 8, total: 8 * 8},
		shipSprite: 0
	},
	Resources: {
		planes: {
			blue:   ["Planes/planeBlue1.png", "Planes/planeBlue2.png", "Planes/planeBlue3.png"],
			green:  ["Planes/planeGreen1.png", "Planes/planeGreen2.png", "Planes/planeGreen3.png"],
			red:    ["Planes/planeRed1.png", "Planes/planeRed2.png", "Planes/planeRed3.png"],
			yellow: ["Planes/planeYellow1.png", "Planes/planeYellow2.png", "Planes/planeYellow3.png"]
		},
		puffs: ["puffSmall.png", "puffLarge.png"],
		background: "background.png"
	},
	Entities: {}
};

/* Initialization */
FlappyBird.init = function(context) {
	context.innerHTML = '<canvas id="canvas">Your browser doesn\'t support HTML5 Canvas!</canvas>';
	FlappyBird.Context = document.getElementById('canvas').getContext('2d');

	let resizefunc = function() {
		console.log("Resize");
		FlappyBird.Context.canvas.width  = window.innerWidth;
		FlappyBird.Context.canvas.height = window.innerHeight-64;
	};
	window.addEventListener("resize", resizefunc);
	resizefunc();

	FlappyBird.Resources = Resources.load(FlappyBird.Resources, "games/flappybird/");

	FlappyBird.loop();
}

FlappyBird.events = function(state, context, res) {

}

/* Game update logic */
FlappyBird.logic = function(state, context, res) {
	state.shipSprite = (state.shipSprite + Timing.delta/48) % res.planes.blue.length;
}

/* Renderer */
FlappyBird.render = function(state, context, res) {
	context.drawImage(res.background, 0, 0, context.canvas.width, context.canvas.height);

	context.drawImage(res.planes.blue[Math.floor(state.shipSprite)], context.canvas.width/2, context.canvas.height/2);
}

/* Gameloop */
FlappyBird.loop = function() {
	Timing.refresh();

	if(FlappyBird.State.running) {
		FlappyBird.events(FlappyBird.State, FlappyBird.Context, FlappyBird.Resources);
		FlappyBird.logic(FlappyBird.State, FlappyBird.Context, FlappyBird.Resources);
		FlappyBird.render(FlappyBird.State, FlappyBird.Context, FlappyBird.Resources);
	}

	requestAnimationFrame(FlappyBird.loop);
}

/* Start */
addEventListener("load", function(){if(typeof Loader !== "undefined") Loader.register(FlappyBird);});
