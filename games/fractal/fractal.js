var Complex = function(r, i) {
	this.r = r;
	this.i = i;
}

Complex.prototype.add = function(that) {return new Complex(this.r + that.r, this.i + that.i);}
Complex.prototype.sub = function(that) {return new Complex(this.r - that.r, this.i - that.i);}
Complex.prototype.abs = function()     {return new Complex(Math.abs(this.r), Math.abs(this.i));}

Complex.prototype.pow = function(power) {
	// Hardcoded entries for accuracy and speed, fallback to floating pow if not found.
	switch (power) {
		case 0:  return new Complex(1, 0);

		case 1:  return new Complex(this.r, this.i);
		case 2:  return new Complex(this.r*this.r - this.i*this.i, 2*this.r*this.i);
		case 3:  return new Complex(this.r*this.r*this.r - 3*this.i*this.i*this.r, 3*this.i*this.r*this.r - this.i*this.i*this.i);
		case 5:  return new Complex(this.r*this.r*this.r*this.r*this.r - 10*this.i*this.i*this.r*this.r*this.r + 5*this.i*this.i*this.i*this.i*this.r, 5*this.i*this.r*this.r*this.r*this.r - 10*this.i*this.i*this.i*this.r*this.r + this.i*this.i*this.i*this.i*this.i);
		case 7:  return new Complex(this.r*this.r*this.r*this.r*this.r*this.r*this.r - 21*this.i*this.i*this.r*this.r*this.r*this.r*this.r + 35*this.i*this.i*this.i*this.i*this.r*this.r*this.r - 7*this.i*this.i*this.i*this.i*this.i*this.i*this.r, 7*this.i*this.r*this.r*this.r*this.r*this.r*this.r - 35*this.i*this.i*this.i*this.r*this.r*this.r*this.r + 21*this.i*this.i*this.i*this.i*this.i*this.r*this.r - this.i*this.i*this.i*this.i*this.i*this.i*this.i);

		case 4:  return this.pow(2).pow(2);
		case 6:  return this.pow(3).pow(2);
		case 8:  return this.pow(4).pow(2);
		case 9:  return this.pow(3).pow(3);
		case 10: return this.pow(5).pow(2);

		default: {
			var rn = Math.pow(Math.sqrt(Math.pow(this.r, 2) + Math.pow(this.i, 2)), power);
			var th = Math.atan(this.i / this.r);

			return new Complex(rn * Math.cos(power * th), rn * Math.sin(power * th));
		}
	}
}

Complex.prototype.mod2 = function() {return this.r*this.r + this.i*this.i;}
Complex.prototype.mul = function(that) {return new Complex(this.r*that.r - this.i*that.i, this.r*that.i + this.i*that.r);}

Complex.prototype.div = function(that) {
	var mod2 = that.mod2();
	return new Complex((this.r*that.r + this.i*that.i)/mod2, (this.i*that.r - this.r*that.i)/mod2);
}

Complex.prototype.inv = function() {return new Complex(1, 0).div(this);}

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
	return (255 << 24) | (Math.round(b * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(r * 255);
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
Fractal.init = function(context) {
	Fractal.State = {
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

		start: -2.5, // Range of the complex plane
		stop: 1.5,
		top: -1.6,
		bottom: 1.6,

		iterations: 500, // Number of iterations to calculate
		threshold: 2.0, // Threshold
		// smooth: true, // Fake decimal iteration count to produce smooth shading

		seedr: Infinity, // Set to a value other than Infinity to view a julia set
		seedi: Infinity, // Ditto

		selected: 0, // Which fractal we are viewing (0-4) auto filled
		order: 2, // Order of exponentiation, negatives allowed and pretty
		inverse: false, // Do we inverse the base (0-1)
		orbit: 0, // Orbit traps (0-2)
		region: 0, // Region splits (0-2)
	};

	context.innerHTML = '<canvas id="canvas">Your browser doesn\'t support HTML5 Canvas!</canvas>';
	Fractal.Context = document.getElementById('canvas').getContext('2d');
	Fractal.Context.canvas = document.getElementById('canvas');

	var resizefunc = function() {
		console.log("Resize");

		Fractal.State.generated = false;
		Fractal.State.scale = Fractal.State.max;

		Fractal.Context.canvas.width  = Fractal.Context.canvas.parentElement.clientWidth / Fractal.State.scale;
		Fractal.Context.canvas.height = Fractal.Context.canvas.parentElement.clientHeight / Fractal.State.scale;

		Fractal.Context.imageData = Fractal.Context.getImageData(0, 0, Fractal.Context.canvas.width, Fractal.Context.canvas.height);

		Fractal.Context.buffer = new ArrayBuffer(Fractal.Context.imageData.data.length);
		Fractal.Context.buffer8 = new Uint8ClampedArray(Fractal.Context.buffer);
		Fractal.Context.buffer32 = new Uint32Array(Fractal.Context.buffer);
	};
	window.addEventListener("resize", resizefunc);
	resizefunc();

	window.addEventListener("wheel", function(e) {
		var positionX = e.x / e.target.clientWidth;
		var positionY = e.y / e.target.clientHeight;
		// This needs to be double the value of the keyboard zoom
		var deltaX = (Fractal.State.stop - Fractal.State.start) / 5;
		var deltaY = (Fractal.State.bottom - Fractal.State.top) / 5;
		if (e.deltaY > 0) {
			Fractal.State.start -= deltaX * positionX;
			Fractal.State.stop += deltaX * (1 - positionX);
			Fractal.State.top -= deltaY * positionY;
			Fractal.State.bottom += deltaY * (1 - positionY);
		} else if(e.deltaY < 0) {
			Fractal.State.start += deltaX * positionX;
			Fractal.State.stop -= deltaX * (1 - positionX);
			Fractal.State.top += deltaY * positionY;
			Fractal.State.bottom -= deltaY * (1 - positionY);
		}
		window.dispatchEvent(new Event('resize'));
	});

	var startX, startY;
	Fractal.Context.canvas.addEventListener("mousedown", function(e) {
		startX = e.x;
		startY = e.y;
	});

	Fractal.Context.canvas.addEventListener("mouseup", function(e) {
		var changeX = (e.x - startX) / e.target.clientWidth;
		var changeY = (e.y - startY) / e.target.clientHeight;
		var deltaX = (Fractal.State.stop - Fractal.State.start) * changeX;
		var deltaY = (Fractal.State.bottom - Fractal.State.top) * changeY;
		Fractal.State.start -= deltaX;
		Fractal.State.stop -= deltaX;
		Fractal.State.top -= deltaY;
		Fractal.State.bottom -= deltaY;
		window.dispatchEvent(new Event('resize'));
	});

	// Precaculate for speed.
	for(var i = 0; i <= Fractal.State.iterations; i++) Fractal.State.colourMap[i] = HSVtoRGB(i / 20.0, 1.0, 1.0);
	Fractal.State.colourMap[Fractal.State.iterations] = 255 << 24;

	// Start the loop
	requestAnimationFrame(Fractal.loop);
}

Fractal.generate = function(x, y) {
	var past = new Complex(
		Fractal.State.start + (Fractal.State.stop   - Fractal.State.start) * x / Fractal.Context.canvas.width,
		Fractal.State.top   + (Fractal.State.bottom - Fractal.State.top  ) * y / Fractal.Context.canvas.height
	);

	/* Using Infinity to indicate that there is no seed */
	var base = Fractal.State.seedr == Infinity ? past : new Complex(Fractal.State.seedr, Fractal.State.seedi);

	if(Fractal.State.inverse) {
		base = base.inv();
		past = past.inv();
	}

	const t = Fractal.State.threshold * Fractal.State.threshold;

	/* For orbit traps */
	var distancelength = Fractal.State.region == 1 ? 5 : (Fractal.State.region == 2 ? 4 : 1);
	var distance = new Array(distancelength).fill(Infinity);

	for(var i = 1; i < Fractal.State.iterations; i++) {
		/* Square complex1, then add complex2 */
		var current;

		switch(Fractal.State.selected) {
			default:
			case 0: /* Mandlebrot */
				current = past.pow(Fractal.State.order).add(base);
				break;
			case 1: /* Burning Ship */
				current = past.abs().pow(Fractal.State.order).add(base);
				break;
			case 2: /* Tricorn */
				current = new Complex(past.r, 0 - past.i).pow(Fractal.State.order).add(base);
				break;
			case 3: /* Nova */
				current = new Complex(1, 0).mul(past.pow(Fractal.State.order).sub(new Complex(1, 0))).div(new Complex(Fractal.State.order, 0).mul(past.pow(Fractal.State.order - 1))).add(base);
				break;
			case 4: /* Circle */
				current = past.pow(Fractal.State.order);
				break;
		}

		/* Modulus */
		var modulus = current.mod2();

		if(Fractal.State.orbit) {
			if(Fractal.State.orbit == 1) {
				if(current.r*current.r < distance[i % distancelength]) distance[i % distancelength] = current.r*current.r;
				if(current.i*current.i < distance[i % distancelength]) distance[i % distancelength] = current.i*current.i;
			} else {
				if(modulus < distance[i % distancelength]) distance[i % distancelength] = modulus;
			}

			var pointer;
			if(Fractal.State.region == 1) {
				pointer = (current.i > 0 ? 1 : 0) + (current.r > 0 ? 2 : 0);
			} else {
				pointer = i % distancelength;
			}

			if(i == Fractal.State.iterations - 1) {
				if(distance[pointer] < 1) {
					return Math.sqrt(distance[pointer]) * Fractal.State.iterations;
				} else {
					return 0;
				}
				break;
			}
		} else {
			if(modulus > t) {
				// if(Fractal.State.smooth) {
				// 	var temp = past.mod2();
				// 	var k = (t - temp) / Math.abs(temp - modulus);
				// 	if(k < 0) k = 0.0;
				// 	return i + k - 1;
				// } else {
					return i - 1;
				// }
			} else if(i == Fractal.State.iterations - 1) {
				/* Fallback if we don't reach anything. We need to fill in everything otherwise we
				   start to see weird patterns as variables don't really have a default here */
				return Fractal.State.iterations;
			}
		}

		/* Copy the new to the old, we will need it later, but by another name */
		past = current;
	}

	return 0;
}

Fractal.events = function(state, context, res) {
	if(Keyboard.delete(37)) { // left
		var delta = (state.stop - state.start) / 10;
		state.start -= delta;
		state.stop -= delta;
		window.dispatchEvent(new Event('resize'));
	}
	if(Keyboard.delete(38)) { // up
		var delta = (state.bottom - state.top) / 10;
		state.top -= delta;
		state.bottom -= delta;
		window.dispatchEvent(new Event('resize'));
	}
	if(Keyboard.delete(39)) { // right
		var delta = (state.stop - state.start) / 10;
		state.start += delta;
		state.stop += delta;
		window.dispatchEvent(new Event('resize'));
	}
	if(Keyboard.delete(40)) { // down
		var delta = (state.bottom - state.top) / 10;
		state.top += delta;
		state.bottom += delta;
		window.dispatchEvent(new Event('resize'));
	}
	if(Keyboard.delete(61)) { // equals/plus
		var deltaX = (state.stop - state.start) / 10;
		var deltaY = (state.bottom - state.top) / 10;
		state.start += deltaX;
		state.stop -= deltaX;
		state.top += deltaY;
		state.bottom -= deltaY;
		window.dispatchEvent(new Event('resize'));
	}
	if(Keyboard.delete(70)) { // f
		state.selected = (state.selected + 1) % 5;
		window.dispatchEvent(new Event('resize'));
	}
	if(Keyboard.delete(72)) { // h
		state.start = -2.5;
		state.stop = 1.5;
		state.top = -1.6;
		state.bottom = 1.6;
		window.dispatchEvent(new Event('resize'));
	}
	if(Keyboard.delete(73)) { // i
		state.inverse = !state.inverse;
		window.dispatchEvent(new Event('resize'));
	}
	if(Keyboard.delete(79)) { // o
		state.orbit = (state.orbit + 1) % 3;
		window.dispatchEvent(new Event('resize'));
	}
	if(Keyboard.delete(80)) { // p
		state.scale = 1;
		state.generated = false;
	}
	if(Keyboard.delete(82)) { // r
		state.region = (state.region + 1) % 3;
		window.dispatchEvent(new Event('resize'));
	}
	if(Keyboard.delete(173)) { // minus/underscore
		var deltaX = (state.stop - state.start) / 10;
		var deltaY = (state.bottom - state.top) / 10;
		state.start -= deltaX;
		state.stop += deltaX;
		state.top -= deltaY;
		state.bottom += deltaY;
		window.dispatchEvent(new Event('resize'));
	}
}

/* Game update logic */
Fractal.logic = function(state, context, res) {
	if(!state.generated || state.scale >= state.min) {
		context.canvas.width  = context.canvas.parentElement.clientWidth / state.scale;
		context.canvas.height = context.canvas.parentElement.clientHeight / state.scale;

		Fractal.Context.imageData = Fractal.Context.getImageData(0, 0, Fractal.Context.canvas.width, Fractal.Context.canvas.height);

		context.buffer = new ArrayBuffer(Fractal.Context.imageData.data.length);
		context.buffer8 = new Uint8ClampedArray(Fractal.Context.buffer);
		context.buffer32 = new Uint32Array(Fractal.Context.buffer);

		state.rendered = false;

		var height = Math.max(1, Math.floor(context.canvas.height));
		var width = Math.max(1, Math.floor(context.canvas.width));

		console.log("Generate" +  width + "x" + height + " @" + state.scale);

		for(var i = 0, y = 0; y < height; y += 1) {
			for(var x = 0; x < width; i += 1, x += 1) {
				context.buffer32[i] = state.colourMap[Math.round(Fractal.generate(x, y))];
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
addEventListener("load", function(){if(typeof Loader !== "undefined") Loader.register(Fractal);});