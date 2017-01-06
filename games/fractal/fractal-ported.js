let fractal_state = {
	width: 0,	   // Pixel width, Auto Filled
	height: 0,	   // Pixel height, Auto Filled

	start: -2.0,	// Range of the complex plane
	stop: 2.0,
	top: -1.6,
	bottom: 1.6,

	iterations: 25,	  // Number of iterations to calculate
	threshold: 2.0,	 // Threshold
	smooth: true,	   // Fake decimal iteration count to produce smooth shading

	seedr: Infinity, // Set to a value other than Infinity to view a julia set
	seedi: Infinity, // Ditto

	selected: 0,	   // Which fractal we are vieing (0-4) auto filled
	order: 2,	   // Order of exponentiation, negatives allowed and pretty
	inverse: true,	   // Do we inverse the base (0-1)
	orbit: 0,	   // Orbit traps (0-2)
	region: 0		// Region splits (0-2)
};

let generate_fractal = function(state, x, y) {
	let past = new Complex(
		state.start + (state.stop   - state.start) * x / state.width,
		state.top   + (state.bottom - state.top  ) * y / state.height
	);

	/* Using FLT_MAX to indicate that there is no seed */
	let base = state.seedr == Infinity ? past : new Complex(state.seedr, state.seedi);

	if(state.inverse) {
		base = base.inv();
		past = past.inv();
	}

	const t = state.threshold * state.threshold;

	/* For orbit traps */
	let distancelength = state.region == 1 ? 5 : (state.region == 2 ? 4 : 1);
	let distance = [];

	for(let i = 0; i < distancelength; i++) distance[i] = Infinity;

	for(let i = 1; i < state.iterations; i++) {
		/* Square complex1, then add complex2 */
		let current;

		switch(state.selected) {
			default:
			case 0: /* Mandlebrot */
				current = past.pow(state.order).add(base);
				break;
			case 1: /* Burning Ship */
				current = past.abs().pow(state.order).add(base);
				break;
			case 2: /* Tricorn */
				current = new Complex(past.r, 0 - past.i).pow(state.order).add(base);
				break;
			case 3: /* Nova */
				current = new Complex(1, 0).mul(past.pow(state.order).sub(new Complex(1, 0))).div(new Complex(state.order, 0).mul(past.pow(state.order - 1))).add(base);
				break;
			case 4: /* Circle */
				current = past.pow(state.order);
				break;
		}

		/* Modulus */
		let modulus = current.mod2();

		if(state.orbit) {
			if(state.orbit == 1) {
				if(current.r*current.r < distance[i % distancelength]) distance[i % distancelength] = current.r*current.r;
				if(current.i*current.i < distance[i % distancelength]) distance[i % distancelength] = current.i*current.i;
			} else {
				if(modulus < distance[i % distancelength]) distance[i % distancelength] = modulus;
			}

			let pointer;
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
				if(state.smooth) {
					let temp = past.mod2();
					let k = (t - temp) / Math.abs(temp - modulus);
					if(k < 0) k = 0.0;
					return i + k - 1;
				} else {
					return i - 1;
				}
			} else if(i == state.iterations - 1) {
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

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/
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

let colour_hue = function(iterations) {
	if(iterations >= 0) {
		return HSVtoRGB(iterations / 10.0, 1.0, 1.0);
	} else {
		return {r: 0, g: 0, b: 0};
	}
}

let context = document.getElementById("canvas").getContext("2d");
context.canvas.width = fractal_state.width = window.innerWidth;
context.canvas.height = fractal_state.height = window.innerHeight;
let data = context.createImageData(context.canvas.width, context.canvas.height);
for(let y = 0; y < context.canvas.height; y++) {
	for(let x = 0; x < context.canvas.width; x++) {
		let color = colour_hue(generate_fractal(fractal_state, x, y));
		let offset = (x + y*context.canvas.width)*4;
		data.data[offset + 0] = color.r;
		data.data[offset + 1] = color.g;
		data.data[offset + 2] = color.b;
		data.data[offset + 3] = 255;
	}
}
context.putImageData(data, 0, 0);

// <!DOCTYPE html>
// <html>
// <head>
// 	<title>Fractal</title>
// 	<style>
// 		html, body {margin: 0; padding: 0; overflow: hidden;}
// 	</style>
// </head>
// <body>
// 	<canvas id="canvas"></canvas>
// </body>
// 	<script src="complex-ported.js"></script>
// 	<script src="fractal-ported.js"></script>
// </html>