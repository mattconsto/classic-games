let Complex = function(r, i) {
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
			let rn = Math.pow(Math.sqrt(Math.pow(this.r, 2) + Math.pow(this.i, 2)), power);
			let th = Math.atan(this.i / this.r);

			return new Complex(rn * Math.cos(power * th), rn * Math.sin(power * th));
		}
	}
}

Complex.prototype.mod2 = function() {return this.r*this.r + this.i*this.i;}
Complex.prototype.mul = function(that) {return new Complex(this.r*that.r - this.i*that.i, this.r*that.i + this.i*that.r);}

Complex.prototype.div = function(that) {
	let mod2 = that.mod2();
	return new Complex((this.r*that.r + this.i*that.i)/mod2, (this.i*that.r - this.r*that.i)/mod2);
}

Complex.prototype.inv = function() {return new Complex(1, 0).div(this);}

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
		size: {scale: 1, width: 200, height: 200, total: 200 * 200},
		running: true,
		generated: false,
		data: [],

		start: -2.0,    // Range of the complex plane
		stop: 2.0,
		top: -1.6,
		bottom: 1.6,

		iterations: 25,      // Number of iterations to calculate
		threshold: 2.0,     // Threshold
		smooth: true,       // Fake decimal iteration count to produce smooth shading

		seedr: Infinity, // Set to a value other than Infinity to view a julia set
		seedi: Infinity, // Ditto

		selected: 0,       // Which fractal we are vieing (0-4) auto filled
		order: 2,       // Order of exponentiation, negatives allowed and pretty
		inverse: false,       // Do we inverse the base (0-1)
		orbit: 0,       // Orbit traps (0-2)
		region: 0        // Region splits (0-2)
	};

	context.innerHTML = '<canvas id="canvas">Your browser doesn\'t support HTML5 Canvas!</canvas>';
	Fractal.Context = document.getElementById('canvas').getContext('2d');

	Fractal.Context.canvas.height = Fractal.State.size.height;
	Fractal.Context.canvas.width  = Fractal.State.size.width;

	let resizefunc = function() {
		console.log("Resize");
		Fractal.Context.canvas.width  = window.innerWidth;
		Fractal.Context.canvas.height = window.innerHeight-64;
		Fractal.State.generated = false;
	};
	window.addEventListener("resize", resizefunc);
	resizefunc();

	Fractal.loop();
}

Fractal.generate = function(x, y) {
	let past = new Complex(
		Fractal.State.start + (Fractal.State.stop   - Fractal.State.start) * x / Fractal.Context.canvas.width,
		Fractal.State.top   + (Fractal.State.bottom - Fractal.State.top  ) * y / Fractal.Context.canvas.height
	);

	/* Using Infinity to indicate that there is no seed */
	let base = Fractal.State.seedr == Infinity ? past : new Complex(Fractal.State.seedr, Fractal.State.seedi);

	if(Fractal.State.inverse) {
		base = base.inv();
		past = past.inv();
	}

	const t = Fractal.State.threshold * Fractal.State.threshold;

	/* For orbit traps */
	let distancelength = Fractal.State.region == 1 ? 5 : (Fractal.State.region == 2 ? 4 : 1);
	let distance = [];

	for(let i = 0; i < distancelength; i++) distance[i] = Infinity;

	for(let i = 1; i < Fractal.State.iterations; i++) {
		/* Square complex1, then add complex2 */
		let current;

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
		let modulus = current.mod2();

		if(Fractal.State.orbit) {
			if(Fractal.State.orbit == 1) {
				if(current.r*current.r < distance[i % distancelength]) distance[i % distancelength] = current.r*current.r;
				if(current.i*current.i < distance[i % distancelength]) distance[i % distancelength] = current.i*current.i;
			} else {
				if(modulus < distance[i % distancelength]) distance[i % distancelength] = modulus;
			}

			let pointer;
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
				if(Fractal.State.smooth) {
					let temp = past.mod2();
					let k = (t - temp) / Math.abs(temp - modulus);
					if(k < 0) k = 0.0;
					return i + k - 1;
				} else {
					return i - 1;
				}
			} else if(i == Fractal.State.iterations - 1) {
				/* Fallback if we don't reach anything. We need to fill in everything otherwise we
				   start to see weird patterns as variables don't really have a default here */
				return -1;
			}
		}

		/* Copy the new to the old, we will need it later, but by another name */
		past = current;
	}

	return 0;
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
	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255)
	};
}

Fractal.color = function(iterations) {
	if(iterations >= 0) {
		return HSVtoRGB(iterations / 10.0, 1.0, 1.0);
	} else {
		return {r: 0, g: 0, b: 0};
	}
}

Fractal.events = function(state, context, res) {

}

/* Game update logic */
Fractal.logic = function(state, context, res) {
	if(!state.generated) {
		state.generated = true;
		console.log("Generate");
		for(let y = 0; y < context.canvas.height; y++) {
			for(let x = 0; x < context.canvas.width; x++) {
				state.data[x+y*context.canvas.width] = Fractal.generate(x, y);
			}
		}
	}
}

/* Renderer */
Fractal.render = function(state, context, res) {
	let image = context.createImageData(context.canvas.width, context.canvas.height);
	for(let y = 0; y < context.canvas.height; y++) {
		for(let x = 0; x < context.canvas.width; x++) {
			let color = Fractal.color(state.data[x+y*context.canvas.width]);
			let offset = (x + y*context.canvas.width)*4;
			image.data[offset + 0] = color.r;
			image.data[offset + 2] = color.b;
			image.data[offset + 3] = 255;
			image.data[offset + 1] = color.g;
		}
	}
	context.putImageData(image, 0, 0);
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