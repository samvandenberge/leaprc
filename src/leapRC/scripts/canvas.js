/**
 * A vertical slider
 * @param {Number} x The top left x position
 * @param {Number} y The top left y position
 * @param {Number} w The width
 * @param {Number} h The height
 * @param {String} fill The fill color
 * 
 */
function Slider (x, y, w, h, fill) {
	this.x    = x    || 100;
	this.y    = y    || 50;
	this.w    = w    || 50;
	this.h    = h    || 150;
	this.fill = fill || '#f3b562';

	this.throttle = 0;
};

/**
 * Draw the slider on the given context
 * @param ctx The context
 *
 */
Slider.prototype.draw = function(ctx) {
	ctx.fillStyle = '#000';
	ctx.fillRect(this.x - 2, this.y - 2, this.w + 4, this.h + 4);

	ctx.fillStyle = '#fff';
	ctx.fillRect(this.x, this.y, this.w, this.h);

	ctx.fillStyle = this.fill;
	ctx.fillRect(this.x, this.y + this.h, this.w, -1 * this.h * this.throttle);
};

/**
 * A joystick
 * @param {Number} x The top left x position
 * @param {Number} y The top left y position
 * @param {Number} radius The radius for the outer circle
 * @param {Number} innerRadius The radius for the inner circle
 */
function Joystick(x, y, radius, innerRadius) {
	this.x           = x           || 250;
	this.y           = y           || 125;
	this.radius      = radius      || 75;
	this.innerRadius = innerRadius || 20;

	this.yaw   = .5;
	this.pitch = .5;
}

/**
 * Draw the joystick on the context
 * @param ctx The context
 *
 */
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
	startY = this.y + this.radius - 2 * this.radius * (1 - this.pitch);

	ctx.beginPath();
	ctx.fillStyle = '#f06060';
	ctx.arc(startX, startY, this.innerRadius, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.fill();
}


/**
 * Since a html5 canvas is stateless, a way is needed to store the slider and joystick
 * @param canvas The html5 canvas
 *
 */
function CanvasState (canvas) {
	// initial configuration
	this.canvas = canvas;
	this.width  = canvas.width;
	this.height = canvas.height;
	this.ctx    = canvas.getContext('2d');
	
	// positioning
	var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
	if (document.defaultView && document.defaultView.getComputedStyle) {
		this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
		this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
		this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
		this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
	}
	var html      = document.body.parentNode;
	this.htmlTop  = html.offsetTop;
	this.htmlLeft = html.offsetLeft;
	
	// add slider and joystick
	this.slider    = new Slider();
	this.joystick  = new Joystick();

	this.valid     = false;

	// cache this
	var state = this;

	this.interval = 30;
	setInterval(function() { state.draw(); }, state.interval);
};

/**
 * Set the slider for the canvas
 * @param {Slider} slider The slider
 *
 */
CanvasState.prototype.setSlider = function(slider) {
	this.slider = slider;
	this.valid = false;
};

/**
 * Set the joystick for the canvas
 * @param {Joystick} joystick The joystick
 *
 */
CanvasState.prototype.setJoystick = function(joystick) {
	this.joystick = joystick;
	this.valid    = false;
};

/**
 * Clear the canvas
 *
 */
CanvasState.prototype.clear = function() {
	this.ctx.clearRect(0, 0, this.width, this.height);
};

/**
 * Draw the slider and joystick on the canvas
 *
 */
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

/**
 * Set the throttle for the slider of the canvas
 * @param {Number} throttle The throttle
 *
 */
CanvasState.prototype.setThrottle = function(throttle) {
	if (this.slider) {
		this.slider.throttle = throttle;
		this.valid           = false;
	}
};

/**
 * Set the yaw for the joystick of the canvas
 * @param {Number} yaw The yaw
 *
 */
CanvasState.prototype.setYaw = function(yaw) {
	if (this.joystick) {
		this.joystick.yaw = yaw;
		this.valid      = false;
	}
};

/**
 * Set the pitch for the joystick of the canvas
 * @param {Number} pitch The pitch
 *
 */
CanvasState.prototype.setPitch = function(pitch) {
	if (this.joystick) {
		this.joystick.pitch = pitch;
		this.valid        = false;
	}
};