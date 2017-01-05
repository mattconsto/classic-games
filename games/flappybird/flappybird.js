var FlappyBird = {
	Info: {
		name: "Flappy Bird",
		path: "flappybird",
		description: "Classic FlappyBird!"
	},
	Context: {},
	State: {
		running: true,
		size: {scale: 1, width: 8, height: 8, total: 8 * 8}
	},
	Resources: {},
	Entities: {}
};

/* Initialization */
FlappyBird.init = function(context) {
	context.innerHTML = '<canvas id="canvas">Your browser doesn\'t support HTML5 Canvas!</canvas>';
	FlappyBird.Context = document.getElementById('canvas').getContext('2d');

	FlappyBird.loop();
}

FlappyBird.events = function(state, context, res) {

}

/* Game update logic */
FlappyBird.logic = function(state, context, res) {
	if(state.state == "play") state.time += Timing.delta/1000;
}

/* Renderer */
FlappyBird.render = function(state, context, res) {
	
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
