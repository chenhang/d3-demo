d3.json("move_path.json", function (error, data) {
    if (error) {
        console.log(error);
    } else {
        var width = 94 * 10;
        var height = 50 * 10;
        var svg = d3.select('body')
            .append('svg')
            .attr({
                'width': width,
                'height': height
            });
        var line = d3.svg.line()
            .x(function(d) {
                console.log(d)
                return d[0]*10;
            })
            .y(function(d) {
                return d[1]*10;
            })
            .interpolate('bundle');

        for (i in data){
            svg.append('path')
                .attr({
                    'd': line(data[i]),
                    'y': 0,
                    'stroke': '#000',
                    'stroke-width': '0.5px',
                    'fill': 'none'
                });
        }
    }});