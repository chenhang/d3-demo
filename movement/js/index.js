var width = 500,
	height = 500;

var balls = [],
	n = 10;

var speed = {
	max: 2,
	min: 1,
};

for (var i = 0; i < n; i++){
	balls.push(new CBall);
}

var svg = d3.select('body')
	.append('svg')
	.attr({
		width: width,
		height: height,
		id: 'mainSVG',
	});

var circles = svg.selectAll('circle')
	.data(balls)
	.enter()
	.append('circle')
	.call(newSVGCircle);

setInterval(loop, 1);

function loop() {
	circles.each(function(d, i) {
		d.correction();
		d3.select(this)
			.transition()
			.duration(1)
			.attrTween('cx', function(d, i, a) {
				return d3.interpolate(a, d.x);
			})
			.attrTween('cy', function(d, i, a) {
				return d3.interpolate(a, d.y);
			});
	});
}

function newSVGCircle(select) {
	select.attr('cx', function(d, i) {
		return d.x;
	});
	select.attr('cy', function(d, i) {
		return d.y;
	});
	select.attr('r', function(d, i) {
		return d.r;
	});
	select.classed('ball', true);
}

function CBall() {

	function rr(min, max) {
		return min + Math.floor(Math.random() * (max - min));
	};

	var padding = 10;

	this.x = rr(padding, width - padding);
	this.y = rr(padding, height - padding);
	this.v = rr(speed.min, speed.max);
	this.a = Math.PI * rr(0, 360) / 180;

	this.r = 5;
	this.vx = this.v * Math.cos(this.a);
	this.vy = this.v * Math.sin(this.a);

	this.step = function() {
		this.x += this.vx;
		this.y += this.vy;
	}

	this.isEdge = function() {

		var x = this.x,
			y = this.y,
			r = this.r + 1,
			w = width - r,
			h = height - r;

		if (x < r) return 'left';
		if (x > w) return 'right';
		if (y < r) return 'top';
		if (y > h) return 'bottom';
		return false;

	}

	this.correction = function() {
		this.step();
		switch (this.isEdge()) {
			case 'left':
			case 'right':
				this.vx *= -1;
				break;
			case 'top':
			case 'bottom':
				this.vy *= -1;
				break;
		}
	}
}