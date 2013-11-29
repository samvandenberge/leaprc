function Slider (x, y, w, h, fill) {
	this.x    = x    || 100;
	this.y    = y    || 50;
	this.w    = w    || 50;
	this.h    = h    || 150;
	this.fill = fill || '#f3b562';

	this.throttle = 0;
};

Slider.prototype.increasePercentage = function () {
	this.throttle = this.throttle + .02 > 1 ? 1 : this.throttle + .02;
}

Slider.prototype.decreasePercentage = function() {
	this.throttle = this.throttle - .02 < 0 ? 0 : this.throttle - .02;
}

Slider.prototype.draw = function(ctx) {
	ctx.fillStyle = '#000';
	ctx.fillRect(this.x - 2, this.y - 2, this.w + 4, this.h + 4);

	ctx.fillStyle = '#fff';
	ctx.fillRect(this.x, this.y, this.w, this.h);

	ctx.fillStyle = this.fill;
	ctx.fillRect(this.x, this.y + this.h, this.w, -1 * this.h * this.throttle);
};

Slider.prototype.contains = function(mx, my) {
	return (this.x <= mx) && (this.x + this.w >= mx) &&
	       (this.y <= my) && (this.y + this.h >= my);
};

function Joystick(x, y, radius, innerRadius) {
	this.x           = x           || 250;
	this.y           = y           || 125;
	this.radius      = radius      || 75;
	this.innerRadius = innerRadius || 20;

	this.yaw   = .5;
	this.pitch = .5;
}

Joystick.prototype.draw = function(ctx) {
	ctx.beginPath();
	ctx.fillStyle = '#000';
	ctx.arc(this.x, this.y, this.radius + 2, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = '#fff';
	ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.fill();

	startX = this.x - this.radius + 2 * this.radius * this.yaw;
	startY = this.y + this.radius - 2 * this.radius * this.pitch; 

	ctx.beginPath();
	ctx.fillStyle = '#f06060';
	ctx.arc(startX, startY, this.innerRadius, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.fill();
}

Joystick.prototype.contains = function(mx, my) {
	return (mx - this.x) * (mx - this.x) + (my - this.y) * (my - this.y) < this.radius * this.radius;
}

function CanvasState (canvas) {
	this.canvas = canvas;
	this.width  = canvas.width;
	this.height = canvas.height;
	this.ctx    = canvas.getContext('2d');
	
	var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
	if (document.defaultView && document.defaultView.getComputedStyle) {
		this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
		this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
		this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
		this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
	}
	var html = document.body.parentNode;
	this.htmlTop = html.offsetTop;
	this.htmlLeft = html.offsetLeft;
	
	this.slider    = new Slider();
	this.joystick  = new Joystick();

	this.valid     = false;
	this.dragging  = false;
	this.selection = null;
	this.dragoffx  = 0;
	this.dragonffy = 0;

	var state = this;

	canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);

	canvas.addEventListener('mousedown', function (e) {
		var mouse    = state.getMouse(e),
		    mx       = mouse.x,
		    my       = mouse.y
		    slider   = state.slider,
		    joystick = state.joystick;

		if (slider.contains(mx, my)) {
			state.dragoffx  = mx - slider.x;
			state.dragonffy = my - slider.y;
			state.dragging  = true;
			state.selection = slider;
			state.valid     = false;
			return;
		}

		if (joystick.contains(mx, my)) {
			state.dragoffx  = mx - slider.x;
			state.dragonffy = my - slider.y;
			state.dragging  = true;
			state.selection = joystick;
			state.valid     = false;
			return;
		}

		if (state.selection) {
			state.selection = null;
			state.valid     = false;
		}
	}, true);

	canvas.addEventListener('mousemove', function(e) {
		var mouse = state.getMouse(e);

		if (!state.dragging) {
			return;
		}

		if (state.selection == state.slider && state.selection.contains(mouse.x, mouse.y)) {
			var p = (state.getMouse(e).y - state.selection.y) / state.selection.h;

			state.selection.throttle = 1 - p;
			state.valid                = false;
		}

		if (state.selection == state.joystick && state.selection.contains(mouse.x, mouse.y)) {
			var pX = (1 + ((state.getMouse(e).x - state.selection.x) / state.selection.radius)) / 2;
			var pY = (1 - ((state.getMouse(e).y - state.selection.y) / state.selection.radius)) / 2;

			state.selection.yaw   = pX;
			state.selection.pitch = pY;
			state.valid           = false;
		}
	}, true);

	canvas.addEventListener('mouseup', function(e) {
		state.dragging = false;
	}, true);

	window.addEventListener('keydown', function(e) {
		var event = window.event || e;
		
		if (event.keyCode === 38) {
			state.slider.increasePercentage();
			state.valid = false;
			return;
		}

		if (event.keyCode === 40) {
			state.slider.decreasePercentage();
			state.valid = false;
			return;
		}
	});

	this.interval = 30;
	setInterval(function() { state.draw(); }, state.interval);
};

CanvasState.prototype.setSlider = function(slider) {
	this.slider = slider;
	this.valid = false;
};

CanvasState.prototype.setJoystick = function(joystick) {
	this.joystick = joystick;
	this.valid    = false;
};

CanvasState.prototype.clear = function() {
	this.ctx.clearRect(0, 0, this.width, this.height);
};

CanvasState.prototype.draw = function() {
	this.valid = false;

	if (!this.valid) {
		var ctx    = this.ctx,
		    slider = this.slider;
		this.clear();
	}

	this.slider.draw(this.ctx);
	this.joystick.draw(this.ctx);

	this.valid = true;
};

CanvasState.prototype.getMouse = function(e) {
	var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

	if (element.offsetParent !== undefined) {
		do {
			offsetX += element.offsetLeft;
			offsetY += element.offsetTop;
		} while (element = element.offsetParent);
	}

	offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
	offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

	mx = e.pageX - offsetX;
	my = e.pageY - offsetY;

	return {x: mx, y: my};
};

CanvasState.prototype.setThrottle = function(throttle) {
	if (this.slider) {
		this.slider.throttle = throttle;
		this.valid           = false;
	}
};

CanvasState.prototype.setYaw = function(yaw) {
	if (this.joystick) {
		this.joystick.yaw = yaw;
		this.valid      = false;
	}
};

CanvasState.prototype.setPitch = function(pitch) {
	if (this.joystick) {
		this.joystick.pitch = pitch;
		this.valid        = false;
	}
};