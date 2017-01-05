var Keyboard = new Set();
document.addEventListener("keydown", function(e) {Keyboard.add(e.keyCode);});
document.addEventListener("keyup",   function(e) {Keyboard.delete(e.keyCode)});

var Timing =  {
	stamp: window.performance.now(),
	delta: 1000/60,
	refresh: function() {
		let temp = window.performance.now();
		this.delta = temp - this.stamp;
		return this.stamp = temp;
	}
}

String.prototype.format = function() {
	var args = arguments;
	return this.replace(/{(\d+)}/g, function(match, number) { 
		return typeof args[number] != 'undefined' ? args[number] : match;
	});
};

String.prototype.formatApply = function() {
	var args = arguments[0];
	return this.replace(/{([\w\d]+)}/g, function(match, number) {
		return typeof args[number] != 'undefined' && !match.startsWith("{_") ? args[number] : match;
	});
};

String.prototype.leftpad = function(padding, length) {
	let output = this;
	while(output.length < length) output = padding + output;
	return output;
}

String.prototype.rightpad = function(padding, length) {
	let output = this;
	while(output.length < length) output = output + padding;
	return output;
}

Boolean.xor = function(a, b) {return ( a || b ) && !( a && b );}

Math.limit = function(val, min, max) {return val < min ? min : (val > max ? max : val);}

Math.randomRange = function(a, b) {
	if(typeof a === "undefined") {
		min = 0; max = Number.MAX_SAFE_INTEGER;
	} else if(typeof b === "undefined") {
		min = 0; max = a
	} else {
		min = a; max = b;
	}
	return Math.random() * (max - min) + min;
}

Element.prototype.remove = function() {this.parentElement.removeChild(this);}

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
	for(var i = this.length - 1; i >= 0; i--) {
		if(this[i] && this[i].parentElement) {
			this[i].parentElement.removeChild(this[i]);
		}
	}
}

// $(document).ready(function(){$('.modal').modal();});