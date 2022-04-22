var Complex = function(r, i) {
	this.r = r;
	this.i = i;
}

Complex.prototype.add = function(that) {
	return new Complex(this.r + that.r, this.i + that.i);
}

Complex.prototype.sub = function(that) {
	return new Complex(this.r - that.r, this.i - that.i);
}

Complex.prototype.abs = function() {
	return new Complex(Math.abs(this.r), Math.abs(this.i));
}

Complex.prototype.pow = function(power) {
	// Hardcoded entries for accuracy and speed, fallback to floating pow
	switch (power) {
		case 0: return new Complex(1, 0);

		case 1: return new Complex(
			this.r,
			this.i
		);
		case 2: return new Complex(
			this.r*this.r - this.i*this.i,
			2*this.r*this.i
		);
		case 3: return new Complex(
			this.r*this.r*this.r - 3*this.i*this.i*this.r,
			3*this.i*this.r*this.r - this.i*this.i*this.i
		);
		case 5: return new Complex(
			this.r*this.r*this.r*this.r*this.r -
				10*this.i*this.i*this.r*this.r*this.r +
				5*this.i*this.i*this.i*this.i*this.r,
			5*this.i*this.r*this.r*this.r*this.r -
				10*this.i*this.i*this.i*this.r*this.r +
				this.i*this.i*this.i*this.i*this.i
		);
		case 7: return new Complex(
			this.r*this.r*this.r*this.r*this.r*this.r*this.r -
				21*this.i*this.i*this.r*this.r*this.r*this.r*this.r +
				35*this.i*this.i*this.i*this.i*this.r*this.r*this.r -
				7*this.i*this.i*this.i*this.i*this.i*this.i*this.r,
			7*this.i*this.r*this.r*this.r*this.r*this.r*this.r -
				35*this.i*this.i*this.i*this.r*this.r*this.r*this.r +
				21*this.i*this.i*this.i*this.i*this.i*this.r*this.r -
				this.i*this.i*this.i*this.i*this.i*this.i*this.i
		);

		case 4: return this.pow(2).pow(2);
		case 6: return this.pow(3).pow(2);
		case 8: return this.pow(4).pow(2);
		case 9: return this.pow(3).pow(3);
		case 10: return this.pow(5).pow(2);

		default: {
			var rn = Math.pow(
				Math.sqrt(Math.pow(this.r, 2) + Math.pow(this.i, 2)),
				power
			);
			var th = Math.atan(this.i / this.r);

			return new Complex(
				rn * Math.cos(power * th),
				rn * Math.sin(power * th)
			);
		}
	}
}

Complex.prototype.mod2 = function() {
	return this.r*this.r + this.i*this.i;
}

Complex.prototype.mul = function(that) {
	return new Complex(
		this.r*that.r - this.i*that.i,
		this.r*that.i + this.i*that.r
	);
}

Complex.prototype.div = function(that) {
	var mod2 = that.mod2();
	return new Complex(
		(this.r*that.r + this.i*that.i)/mod2,
		(this.i*that.r - this.r*that.i)/mod2
	);
}

Complex.prototype.inv = function() {
	return new Complex(1, 0).div(this);
}

function HSVtoRGB(h, s, v) {
	var r, g, b, i, f, p, q, t;

	if (arguments.length === 1) {
		s = h.s, v = h.v, h = h.h;
	}

	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);

	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}

	return (255 << 24) |
		(Math.round(b * 255) << 16) |
		(Math.round(g * 255) << 8) |
		Math.round(r * 255);
}

var Fractal = {
	Info: {
		name: "Fractal",
		path: "fractal",
		description: "Classic Fractal."
	},
	Context: {},
	State: {},
	Resources: {
		tilesheet: []
	},
	Entities: {}
};

/* Initialization */
Fractal.init = function(wrapper) {
	var state = {
		size: {scale: 1},
		running: true,
		generated: false,
		rendered: false,
		data: [],
		scale: 128,
		max: 128,
		min: 4,
		colourMap: [],
		image: [],
		touching: false,
		moveMultiplier: 10,
		zoomMultiplier: 5,
		iterationsMultiplier: 1000, // For smooth colouring

		start: -2.5, // Range of the complex plane
		stop: 1.5,
		top: -1.6,
		bottom: 1.6,

		iterations: 500, // Number of iterations to calculate
		threshold: 2.0, // Threshold
		// smooth: true, // Smooth shading

		seedr: Infinity, // Set to a not Infinity to view a Julia Set
		seedi: Infinity, // Ditto

		selected: 0, // Which fractal we are viewing (0-4) auto filled
		order: 2, // Order of exponentiation, negatives allowed and pretty
		inverse: false, // Do we inverse the base (0-1)
		orbit: 0, // Orbit traps (0-2)
		region: 0, // Region splits (0-2)
	};
	Fractal.State = state;

	wrapper.innerHTML = '<canvas id="canvas">' +
		'Your browser doesn\'t support HTML5 Canvas!' +
		'</canvas>';
	var context = document.getElementById('canvas').getContext('2d');
	Fractal.Context = context;
	context.canvas = document.getElementById('canvas');
	context.canvas.style.width = "100%";

	var resizefunc = function() {
		console.log("Resize");

		context.canvas.width  = context.canvas.parentElement.clientWidth
		                            / state.scale;
		context.canvas.height = context.canvas.parentElement.clientHeight
		                            / state.scale;

		context.imageData = context.getImageData(0, 0,
			Math.max(1, context.canvas.width),
			Math.max(1, context.canvas.height),
		);

		context.buffer = new ArrayBuffer(context.imageData.data.length);
		context.buffer8 = new Uint8ClampedArray(context.buffer);
		context.buffer32 = new Uint32Array(context.buffer);

		Fractal.Redraw();
	};
	window.addEventListener("resize", resizefunc);
	resizefunc();

	window.addEventListener("wheel", function(e) {
		e.preventDefault();

		var positionX = e.x / e.target.clientWidth;
		var positionY = e.y / e.target.clientHeight;
		var deltaX = (state.stop - state.start) / state.zoomMultiplier;
		var deltaY = (state.bottom - state.top) / state.zoomMultiplier;

		if (e.deltaY > 0) {
			state.start -= deltaX * positionX;
			state.stop += deltaX * (1 - positionX);
			state.top -= deltaY * positionY;
			state.bottom += deltaY * (1 - positionY);
		} else if(e.deltaY < 0) {
			state.start += deltaX * positionX;
			state.stop -= deltaX * (1 - positionX);
			state.top += deltaY * positionY;
			state.bottom -= deltaY * (1 - positionY);
		}

		Fractal.Redraw();
	});

	window.addEventListener("mousedown", function(e) {
		if (e.button == 2) return;

		if (e.target.nodeName.toLowerCase() != 'canvas') return;

		e.stopPropagation();

		if(!state.juliaEnabled) {
			state.startX = e.clientX;
			state.startY = e.clientY;
		}
	});

	window.addEventListener("mousemove", function(e) {
		if (e.button == 2) return;

		if (e.target.nodeName.toLowerCase() != 'canvas') return;

		e.stopPropagation();

		if(!state.juliaEnabled && state.startX && state.startY) {
			var changeX = (e.clientX - state.startX);
			var changeY = (e.clientY - state.startY);
			context.canvas.style.left = "calc(50% + " + changeX + "px)";
			context.canvas.style.top = "calc(50% + " + changeY + "px)";
		}
	});

	window.addEventListener("mouseup", function(e) {
		if (e.button == 2) return;

		if (
			(state.startX == undefined || state.startY == undefined) &&
			!state.juliaEnabled
		) return;

		e.stopPropagation();

		if (e.target.nodeName.toLowerCase() != 'canvas') {
			context.canvas.style.left = '50%';
			context.canvas.style.top = '50%';
			delete state.startX;
			delete state.startY;
			return;
		}

		if(!state.juliaEnabled) {
			var changeX = (e.clientX - state.startX) / e.target.clientWidth;
			var changeY = (e.clientY - state.startY) / e.target.clientHeight;
			var deltaX = (state.stop - state.start) * changeX;
			var deltaY = (state.bottom - state.top) * changeY;
			state.start -= deltaX;
			state.stop -= deltaX;
			state.top -= deltaY;
			state.bottom -= deltaY;
		} else {
			var positionX = e.clientX / e.target.clientWidth;
			var positionY = e.clientY / e.target.clientHeight;
			var placeX = state.start + (state.stop - state.start) * positionX;
			var placeY = state.top + (state.bottom - state.top) * positionY;
			state.seedr = placeX;
			state.seedi = placeY;
			state.juliaEnabled = false;
			context.canvas.style.cursor = 'move';
		}
		context.canvas.style.left = '50%';
		context.canvas.style.top = '50%';
		delete state.startX;
		delete state.startY;
		Fractal.Redraw();
	});

	window.addEventListener("dblclick", function(e) {
		if (e.button == 2) return;

		if (e.target.nodeName.toLowerCase() != 'canvas') return;

		e.stopPropagation();

		var deltaX = (state.stop - state.start) / state.zoomMultiplier;
		var deltaY = (state.bottom - state.top) / state.zoomMultiplier;
		state.start += deltaX;
		state.stop -= deltaX;
		state.top += deltaY;
		state.bottom -= deltaY;
	});

	window.addEventListener("touchstart", function(e) {
		e.stopPropagation();

		if (state.touching !== false) return;

		state.touching = e.changedTouches[0].identifier;
		var event = new MouseEvent("mousedown", e.changedTouches[0]);
		Object.defineProperty(event, 'target', {
			writable: false, value: e.target
		});
		window.dispatchEvent(event);
	});

	window.addEventListener("touchmove", function(e) {
		e.stopPropagation();

		for (var i = 0; i < e.changedTouches.length; i++) {
			if(state.touching == e.changedTouches[i].identifier) {
				var event = new MouseEvent("mousemove", e.changedTouches[i]);
				Object.defineProperty(event, 'target', {
					writable: false, value: e.target
				});
				window.dispatchEvent(event);
				break;
			}
		}
	});

	window.addEventListener("touchend", function(e) {
		e.stopPropagation();

		for (var i = 0; i < e.changedTouches.length; i++) {
			if(state.touching == e.changedTouches[i].identifier) {
				var event = new MouseEvent("mouseup", e.changedTouches[i]);
				Object.defineProperty(event, 'target', {
					writable: false, value: e.target
				});
				window.dispatchEvent(event);
				state.touching = false;
				break;
			}
		}
	});

	context.canvas.addEventListener("touchstart", function(e) {
		e.preventDefault();
	});

	context.canvas.addEventListener("touchmove", function(e) {
		e.preventDefault();
	});

	context.canvas.addEventListener("touchend", function(e) {
		e.preventDefault();
	});

	// Precaculate for speed.
	for(var i = 0; i <= state.iterations * state.iterationsMultiplier; i++) {
		state.colourMap[i] = HSVtoRGB(
			i / 20.0 / state.iterationsMultiplier,
			1.0,
			1.0,
		);
	}
	state.colourMap[-1] = 255 << 24;

	// Start the loop
	requestAnimationFrame(Fractal.loop);
}

Fractal.generate = function(state, context, x, y) {
	var past = new Complex(
		state.start + (state.stop   - state.start) * x / context.canvas.width,
		state.top   + (state.bottom - state.top  ) * y / context.canvas.height,
	);

	/* Using Infinity to indicate that there is no seed */
	var base = state.seedr == Infinity ? past : new Complex(
		state.seedr,
		state.seedi
	);

	if(state.inverse) {
		base = base.inv();
		past = past.inv();
	}

	const t = state.threshold * state.threshold;

	/* For orbit traps */
	var distancelength = state.region == 1 ? 5 : (
		state.region == 2 ? 4 : 1
	);

	var distance = [];
	for(var i = 0; i < distancelength; i++) {
		distance.push(Infinity);
	}

	for(var i = 1; i < state.iterations; i++) {
		/* Square complex1, then add complex2 */
		var current;

		switch(state.selected) {
			default:
			case 0: /* Mandlebrot */
				current = past.pow(state.order).add(base);
				break;
			case 1: /* Burning Ship */
				current = past.abs().pow(state.order).add(base);
				break;
			case 2: /* Tricorn */
				current = new Complex(past.r, 0 - past.i).pow(
					state.order
				).add(base);
				break;
			case 3: /* Nova */
				current = new Complex(1, 0).mul(
					past.pow(state.order).sub(new Complex(1, 0))
				).div(
					new Complex(state.order, 0).mul(
						past.pow(state.order - 1)
					)
				).add(base);
				break;
			case 4: /* Circle */
				current = past.pow(state.order);
				break;
		}

		/* Modulus */
		var modulus = current.mod2();

		if(state.orbit) {
			if(state.orbit == 1) {
				if(current.r*current.r < distance[i % distancelength]) {
					distance[i % distancelength] = current.r*current.r;
				}
				if(current.i*current.i < distance[i % distancelength]) {
					distance[i % distancelength] = current.i*current.i;
				}
			} else {
				if(modulus < distance[i % distancelength]) {
					distance[i % distancelength] = modulus;
				}
			}

			var pointer;
			if(state.region == 1) {
				pointer = (current.i > 0 ? 1 : 0) + (current.r > 0 ? 2 : 0);
			} else {
				pointer = i % distancelength;
			}

			if(i == state.iterations - 1) {
				if(distance[pointer] < 1) {
					return Math.sqrt(distance[pointer]) * state.iterations;
				} else {
					return 0;
				}
				break;
			}
		} else {
			if(modulus > t) {
				// if(state.smooth) {
					var temp = past.mod2();
					var k = (t - temp) / Math.abs(temp - modulus);
					if(k < 0) k = 0.0;
					return state.iterationsMultiplier * (i + k - 1);
				// } else {
				// 	return i - 1;
				// }
			} else if(i == state.iterations - 1) {
				/* Fallback if we don't reach anything. We need to fill in
				   everything otherwise we start to see weird patterns as
				   variables don't really have a default here */
				return -1;
			}
		}

		/* Copy the new to the old, we will need it later, by another name */
		past = current;
	}

	return 0;
}

Fractal.Redraw = function() {
	Fractal.State.generated = false;
	Fractal.State.scale = Fractal.State.max;
	var downloadButton = document.getElementById("download-button");
	downloadButton.innerHTML = "high_quality";
}

Fractal.events = function(state, context, res) {
	if(Keyboard.delete(37)) { // left
		var delta = (state.stop - state.start) / state.moveMultiplier;
		state.start -= delta;
		state.stop -= delta;
		Fractal.Redraw();
	}
	if(Keyboard.delete(38)) { // up
		var delta = (state.bottom - state.top) / state.moveMultiplier;
		state.top -= delta;
		state.bottom -= delta;
		Fractal.Redraw();
	}
	if(Keyboard.delete(39)) { // right
		var delta = (state.stop - state.start) / state.moveMultiplier;
		state.start += delta;
		state.stop += delta;
		Fractal.Redraw();
	}
	if(Keyboard.delete(40)) { // down
		var delta = (state.bottom - state.top) / state.moveMultiplier;
		state.top += delta;
		state.bottom += delta;
		Fractal.Redraw();
	}
	if(Keyboard.delete(61)) { // equals/plus
		var deltaX = (state.stop - state.start) / state.zoomMultiplier;
		var deltaY = (state.bottom - state.top) / state.zoomMultiplier;
		state.start += deltaX;
		state.stop -= deltaX;
		state.top += deltaY;
		state.bottom -= deltaY;
		Fractal.Redraw();
	}
	if(Keyboard.delete(69)) { // e
		state.order = Math.max(2, (state.order + 1) % 7);
		Fractal.Redraw();
	}
	if(Keyboard.delete(70)) { // f
		state.selected = (state.selected + 1) % 5;
		Fractal.Redraw();
	}
	if(Keyboard.delete(72)) { // h
		state.start = -2.5;
		state.stop = 1.5;
		state.top = -1.6;
		state.bottom = 1.6;
		Fractal.Redraw();
	}
	if(Keyboard.delete(73)) { // i
		state.inverse = !state.inverse;
		Fractal.Redraw();
	}
	if(Keyboard.delete(74)) { // j
		var homeButton = document.getElementById("home-button");
		var juliaButton = document.getElementById("julia-button");
		if(juliaButton.style.display == 'none') {
			homeButton.style.display = 'none';
			juliaButton.style.display = '';
			state.juliaEnabled = false;
			context.canvas.style.cursor = 'move';
			state.seedr = Infinity;
			state.seedi = Infinity;
			Fractal.Redraw();
		} else {
			homeButton.style.display = '';
			juliaButton.style.display = 'none';
			state.juliaEnabled = true;
			context.canvas.style.cursor = 'crosshair';
		}
	}
	if(Keyboard.delete(79)) { // o
		state.orbit = (state.orbit + 1) % 3;
		Fractal.Redraw();
	}
	if(Keyboard.delete(80)) { // p
		if(state.scale >= 1) {
			state.scale = 1;
			state.generated = false;
			var downloadButton = document.getElementById("download-button");
			downloadButton.innerHTML = "download";
		} else if(state.generated) {
			var link = document.createElement('a');
			link.setAttribute('download', 'fractal.png');
			link.setAttribute('href', context.canvas.toDataURL('image/png'));
			link.click();
		}
	}
	if(Keyboard.delete(82)) { // r
		state.region = (state.region + 1) % 3;
		Fractal.Redraw();
	}
	if(Keyboard.delete(173)) { // minus/underscore
		var deltaX = (state.stop - state.start) / state.zoomMultiplier;
		var deltaY = (state.bottom - state.top) / state.zoomMultiplier;
		state.start -= deltaX;
		state.stop += deltaX;
		state.top -= deltaY;
		state.bottom += deltaY;
		Fractal.Redraw();
	}
}

/* Game update logic */
Fractal.logic = function(state, context, res) {
	if(!state.generated || state.scale >= state.min) {
		context.canvas.width  = context.canvas.parentElement.clientWidth
		                            / state.scale;
		context.canvas.height = context.canvas.parentElement.clientHeight
		                            / state.scale;

		Fractal.Context.imageData = context.getImageData(0, 0,
			Math.max(1, context.canvas.width),
			Math.max(1, context.canvas.height),
		);

		context.buffer = new ArrayBuffer(context.imageData.data.length);
		context.buffer8 = new Uint8ClampedArray(context.buffer);
		context.buffer32 = new Uint32Array(context.buffer);

		state.rendered = false;

		var height = Math.max(1, Math.floor(context.canvas.height));
		var width = Math.max(1, Math.floor(context.canvas.width));

		console.log("Generate" +  width + "x" + height + " @" + state.scale);

		for(var i = 0, y = 0; y < height; y += 1) {
			for(var x = 0; x < width; i += 1, x += 1) {
				context.buffer32[i] = state.colourMap[
					Math.round(Fractal.generate(state, context, x, y))
				];
			}
		}
		context.imageData.data.set(context.buffer8);

		state.generated = true;

		state.timer = 0;
		state.scale = Math.floor(state.scale / 2);
	}
}

/* Renderer */
Fractal.render = function(state, context, res) {
	if(state.rendered) return;
	context.putImageData(context.imageData, 0, 0);
	state.rendered = true;
}

/* Gameloop */
Fractal.loop = function() {
	Timing.refresh();

	if (Fractal.State.running) {
		Fractal.events(Fractal.State, Fractal.Context, Fractal.Resources);
		Fractal.logic(Fractal.State, Fractal.Context, Fractal.Resources);
	}
	Fractal.render(Fractal.State, Fractal.Context, Fractal.Resources);

	requestAnimationFrame(Fractal.loop);
}

/* Start */
addEventListener("load", function() {
	if(typeof Loader !== "undefined") Loader.register(Fractal);
});
