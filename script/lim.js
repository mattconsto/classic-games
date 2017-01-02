Math.lim = function(val, min, max) {
	return val < min ? min : (val > max ? max : val);
}