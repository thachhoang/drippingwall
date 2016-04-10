/* globals isMobile:false */

// Modified from code by Simon Sarris
// www.simonsarris.com
// sarris@acm.org

function Shape(x, y, w, h, c, fill, speed) {
    // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 1; // width
    this.h = h || 1; // height
    this.c = c || 0; // curve height
    this.speed = speed || 10; // dripping speed
    this.fill = fill || '#AAAAAA'; // fill color
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
    ctx.bezierCurveTo(l, t + c, r, t + c, r, t);
    ctx.lineTo(r, b + 1); // extra pixels to eliminate white gaps
    ctx.bezierCurveTo(r, b + c + 1, l, b + c + 1, l, b + 1);
    ctx.lineTo(l, t);
    ctx.closePath();
    ctx.fillStyle = this.fill;
    ctx.fill();
};

function CanvasState(canvas) {
    // **** First some setup! ****
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');

    this.speed = 7;
    this.barWidth = 20;
    this.barHeight = 50;
    this.barCurve = 20;

    this.delay = 0;
    this.updated = 0;

    // **** Keep track of state! ****
    this.active = true; // draw if state is active
    this.shapes = []; // the collection of things to be drawn

    // **** Then events! ****
    var myState = this;

    // generate the first drips
    this.generate();
}

CanvasState.prototype.addShape = function(shape) {
    this.shapes.push(shape);
};

CanvasState.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
};

CanvasState.prototype.generate = function() {
    var bw = this.barWidth,
        bh = this.barHeight,
        bc = this.barCurve,
        cols = Math.ceil(this.width / bw),
        rows = 3 + Math.floor(this.height / bh),
        color;

    this.shapes = [];
    this.rows = rows;
    this.cols = cols;

    for (var i = 0; i < cols; i++) {
        var offset = Math.floor(Math.random() * bh);
        var speed = Math.random();
        var baseColor = Math.random() * 0xFFFFFF << 0;
        for (var j = rows; j > -3; j--) {
            color = (baseColor * Math.random() << 0).toString(16);
            color = "#" + ("000000" + color).slice(-6);
            this.addShape(new Shape(i * bw, j * bh + offset, bw, bh, bc, color, speed));
        }
    }
};

CanvasState.prototype.draw = function() {
    if (this.speed > 0)
        this.active = true;

    // resize canvas if users resize window
    var ctx = this.ctx;
    if (this.width != window.innerWidth || this.height != window.innerHeight) {
        var regen = (this.width < window.innerWidth || this.height < window.innerHeight);
        this.width = ctx.canvas.width = window.innerWidth;
        this.height = ctx.canvas.height = window.innerHeight;
        if (regen)
            this.generate();
        this.active = true;
    }

    if (this.active) {
        // wipe canvas
        this.clear();

        var shapes = this.shapes,
            speed = this.speed,
            w = this.width,
            h = this.height,
            rh = this.barHeight * this.rows;

        // draw all shapes
        var l = shapes.length;
        for (var i = 0; i < l; i++) {
            var shape = shapes[i];

            // skip off-screen-width elements
            if (shape.x > w || shape.x + shape.w < 0)
                continue;

            shapes[i].draw(ctx);

            // wrap vertically
            if (shape.y > h)
                shape.y -= rh;

            // drip
            shape.y += 1 + Math.floor(shape.speed * (speed + 1));
        }

        // draw only once
        if (speed === 0)
            this.active = false;
    }
};

//init();
function init() {
    var c = document.getElementById('canvas'),
        g = document.getElementById('gauge'),
        s = new CanvasState(c),
        max_speed = 66,
        lock = false;

    var update = function(time) {
        window.requestAnimationFrame(update);
        if (time < s.updated)
            time = Date.now();
        if (time - s.updated > s.delay) {
            s.updated = time;
            s.draw();
        }
    };
    s.updated = Date.now();
    update(s.updated + s.delay + 1);

    g.innerHTML = Math.round(100 * (s.speed / max_speed));
    var adjust = function(e) {
        var tar = 20,
            ns,
            my = e.clientY,
            wy = window.innerHeight;
        if (my < tar)
            ns = 0; // top 20px gutter: no movement
        else if (my > wy - tar)
            ns = 1; // bottom 20px gutter: maximum speed
        else
            ns = (my - tar) / (wy - 2 * tar);
        s.speed = max_speed * ns;
        g.innerHTML = Math.round(100 * ns) + (lock && !isMobile.any() ? " locked" : "");
    };

    c.onmousemove = function(e) {
        if (!lock)
            adjust(e);
    };

    c.onclick = function(e) {
        lock = !lock; // toggle tracking mouse position
        adjust(e);
    };
}