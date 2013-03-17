// Modified from code by Simon Sarris
// www.simonsarris.com
// sarris@acm.org
//
// Last update December 2011
//
// Free to use and distribute at will
// So long as you are nice to people, etc

// Constructor for Shape objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.

function Shape(x, y, w, h, fill) {
	// This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
	// "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
	this.x = x || 0;
	this.y = y || 0;
	this.w = w || 1;
	this.h = h || 1;
	this.c = 20;
	this.fill = fill || '#AAAAAA';
}

// Draws this shape to a given context
Shape.prototype.draw = function(ctx) {
	var c = this.c,
		l = this.x,
		t = this.y,
		r = this.x + this.w,
		b = this.y + this.h;
	ctx.beginPath();
	ctx.moveTo(l, t);
	ctx.bezierCurveTo(l, t-c, r, t-c, r, t);
	ctx.lineTo(r, b);
	ctx.bezierCurveTo(r, b+c, l, b+c, l, b);
	ctx.lineTo(l, t);
	ctx.closePath();
	ctx.fillStyle = this.fill;
	ctx.fill();
}

// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function(mx, my) {
	return (this.x <= mx) && (this.x + this.w >= mx) && (this.y <= my) && (this.y + this.h >= my);
}

function CanvasState(canvas) {
	// **** First some setup! ****
	
	this.canvas = canvas;
	this.width = canvas.width;
	this.height = canvas.height;
	this.ctx = canvas.getContext('2d');
	
	this.speed = 5;
	this.barWidth = 20;
	this.barHeight = 50;
	
	// **** Keep track of state! ****
	
	this.active = true;
	this.shapes = [];  // the collection of things to be drawn
	
	// **** Then events! ****
	
	// This is an example of a closure!
	// Right here "this" means the CanvasState. But we are making events on the Canvas itself,
	// and when the events are fired on the canvas the variable "this" is going to mean the canvas!
	// Since we still want to use this particular CanvasState in the events we have to save a reference to it.
	// This is our reference!
	var myState = this;
	
	this.interval = 1000;
	setInterval(function() { myState.draw(); }, myState.interval);
}

CanvasState.prototype.addShape = function(shape) {
	this.shapes.push(shape);
}

CanvasState.prototype.clear = function() {
	this.ctx.clearRect(0, 0, this.width, this.height);
}

CanvasState.prototype.generate = function() {
	this.shapes = [];
	
	this.addShape(new Shape(40,40,50,50)); // The default is gray
	this.addShape(new Shape(60,140,40,60, 'lightskyblue'));
	// Lets make some partially transparent
	this.addShape(new Shape(80,150,60,30, 'rgba(127, 255, 212, .5)'));
	this.addShape(new Shape(125,80,30,80, 'rgba(245, 222, 179, .7)'));	
}

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function() {
	if (this.active) {
		var ctx = this.ctx;
		this.clear();
		
		if (this.width != window.innerWidth || this.height != window.innerHeight) {
			this.width = ctx.canvas.width  = window.innerWidth;
			this.height = ctx.canvas.height = window.innerHeight;
			this.generate();
		}
		
		var shapes = this.shapes;
		
		// ** Add stuff you want drawn in the background all the time here **
		
		// draw all shapes
		var l = shapes.length;
		for (var i = 0; i < l; i++) {
			var shape = shapes[i];
			shape.y += this.speed;
			if (shape.y > this.height) {
				shape.y = -shape.h;
			}
			// We can skip the drawing of elements that have moved off the screen:
			if (shape.x > this.width || shape.x + shape.w < 0) {
				continue;
			}
			shapes[i].draw(ctx);
		}
		
		// ** Add stuff you want drawn on top all the time here **
	}
}

// If you dont want to use <body onLoad='init()'>
// You could uncomment this init() reference and place the script reference inside the body tag
//init();

function init() {
	var s = new CanvasState(document.getElementById('canvas1'));
	s.generate();
}

// Now go make something amazing!