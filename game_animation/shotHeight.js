d3.json("shot_height.json", function (error, data) {
    if (error) {
        console.log(error);
    } else {
        var width = 94 * 10;
        var height = 20 * 10;
        var svg = d3.select('svg');

        var line = d3.svg.line()
            .x(function(d) {
                return d[0]*10;
            })
            .y(function(d) {
                return height - d[2]*10;
            })

        for (i in data){
            svg.append('path')
                .attr({
                    'd': line(data[i]),
                    'y': 0,
                    'stroke': '#E6E8FA',// gold: '#CD7F32', sliver: '#E6E8FA'
                    'stroke-width': '1px',
                    'fill-opacity': '0.8',
                    'fill': 'none'
                });
        }
    }});