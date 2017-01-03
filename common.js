if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}

Math.limit = function(val, min, max) {
	return val < min ? min : (val > max ? max : val);
}

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

Element.prototype.remove = function() {
	this.parentElement.removeChild(this);
}

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
	for(var i = this.length - 1; i >= 0; i--) {
		if(this[i] && this[i].parentElement) {
			this[i].parentElement.removeChild(this[i]);
		}
	}
}

$(document).ready(function(){$('.modal').modal();});