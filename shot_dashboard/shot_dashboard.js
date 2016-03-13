var width = 800,
    height = 600,
    radius = Math.min(width, height) ,
    spacing = .5;

var color = d3.scale.linear()
    .range(["hsl(180,70%,70%)", "hsl(-180,70%,70%)"])
    .interpolate(interpolateHsl);

var arc = d3.svg.arc()
    .startAngle(function(d) { return ((Math.PI/2)-(d.value * .5 * Math.PI)); })
    .endAngle(Math.PI /2)
    .innerRadius(function(d) { if(d.index==.1){ return 0; }else{return  (d.index-.1 + spacing) * radius; }})
    .outerRadius(function(d) { return (d.index + spacing) * radius; });

var formatter = d3.format(".2%");
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + (width/4)*1 + "," + (height/4)*3  + ")");


var field = svg.selectAll("g")
    .data(fields)
    .enter().append("g");


field.append("path");
field.append("text");

d3.transition().duration(0).each(tick);
d3.select(self.frameElement).style("height", height + "px");

function tick() {
    field = field
        .each(function(d) { this._value = d.value; })
        .data(fields)
        .each(function(d) { d.previousValue = this._value; });

    field.select("path")
        .transition()
        .ease("linear")
        .attrTween("d", arcTween)
        .style("opacity", function(d) { return .7; })
        .style("fill", function(d) { return color(d.index); });

    field.select("text")
        .attr("x", function(d) { return  (d.index-.1 + spacing) * radius;  })
        .attr("y",function(d) { return 0; })
        .text(function(d) { return formatter(d.value ); })
        .style("font-size","15px")
        .transition()
        .ease("linear")
        .attr("transform", function(d) {
            return "rotate(0)"
                + "translate(0,0)"
                + "rotate(0)"
        });

}

function arcTween(d) {
    var i = d3.interpolateNumber(d.previousValue, d.value);
    return function(t) { d.value = i(t); return arc(d); };
}

function fields() {
    var now = new Date;
    return [
        {index: .1,  value: .4},
        {index: .2,  value: .3},
        {index: .3,  value: .2},
        {index: .4,  value: .1}
    ];
}


// Avoid shortest-path interpolation.
function interpolateHsl(a, b) {
    var i = d3.interpolateString(a, b);
    return function(t) {
        return d3.hsl(i(t));
    };
}