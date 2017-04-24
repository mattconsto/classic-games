var Platformer = {
	Info: {
		name: "Platformer",
		path: "platformer",
		description: "A platformer, I guess?!?"
	},
	Context: {},
	State: {
		running: true,
	},
	Resources: {
		background: "Backgrounds/blue_grass.png",
	},
	Entities: {}
};

/* Initialization */
Platformer.init = function(context) {
	context.innerHTML = '<canvas id="canvas">Your browser doesn\'t support HTML5 Canvas!</canvas>';
	Platformer.Context = document.getElementById('canvas').getContext('2d');

	let resizefunc = function() {
		console.log("Resize");
		Platformer.Context.canvas.width  = window.innerWidth;
		Platformer.Context.canvas.height = window.innerHeight-64;
	};
	window.addEventListener("resize", resizefunc);
	resizefunc();

	Platformer.Resources = Resources.load(Platformer.Resources, "games/platformer/");

	Platformer.loop();
}

Platformer.events = function(state, context, res) {

}

/* Game update logic */
Platformer.logic = function(state, context, res) {

}

/* Renderer */
Platformer.render = function(state, context, res) {
	context.drawImage(res.background, 0, 0, context.canvas.width, context.canvas.height);
}

/* Gameloop */
Platformer.loop = function() {
	Timing.refresh();

	if(Platformer.State.running) {
		Platformer.events(Platformer.State, Platformer.Context, Platformer.Resources);
		Platformer.logic(Platformer.State, Platformer.Context, Platformer.Resources);
		Platformer.render(Platformer.State, Platformer.Context, Platformer.Resources);
	}

	requestAnimationFrame(Platformer.loop);
}

/* Start */
addEventListener("load", function(){if(typeof Loader !== "undefined") Loader.register(Platformer);});
