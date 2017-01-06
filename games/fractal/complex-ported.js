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