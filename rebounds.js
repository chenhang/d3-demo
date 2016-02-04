var westbrooks = 'PtRebLog/201566.json';
var overall = 'overall/overall.json';
d3.json("./sample_data/rebounds/" + westbrooks, function (error, data) {
    if (error) {
        console.log(error);
    } else {
        var height = 400;
        var width = 400;
        var mid_length = 20;
        var rebound_data = {};
        var grouped_data = [];
        var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g");

        var reb_dist = d3.scale.quantize()
            .domain([0 , 30])
            .range(d3.range(0, width/2, mid_length));
        var dist = d3.scale.linear()
            .domain([0, 30])
            .range()
        draw('reb_dist');
        function draw(dist_type) {
            var max_rebound_num = 0;
            var min_rebound_num = 0;
            for (var i = 0; i < data.length; i ++) {
                var dist = data[i][dist_type];
                var key = ''+dist;
                if (rebound_data[key]) {
                    rebound_data[key].rebounds.push(data[i]);
                    rebound_data[key].num += 1;
                } else {
                    rebound_data[key] = {};
                    rebound_data[key].rebounds = [data[i]];
                    rebound_data[key].dist = dist;
                    rebound_data[key].num = 1;
                    grouped_data.push(rebound_data[key]);
                }
                max_rebound_num = Math.max(max_rebound_num, rebound_data[key].num);
                min_rebound_num = Math.min(min_rebound_num, rebound_data[key].num);
            }
            var opacity = d3.scale.linear()
                .domain([min_rebound_num , max_rebound_num])
                .range([0, 1]);
            for (var i = grouped_data.length - 1; i >= 0; i --) {
                var dist = grouped_data[i].dist;
                var num = grouped_data[i].num;
                var rebounds = grouped_data[i];
                var arc = drawArc(dist, dist + mid_length);
                svg.append("path")
                    .attr("d", arc)
                    .attr("fill", function () {
                        return 'red';
                    })
                    .attr('fill-opacity', function () {
                        return opacity(num);
                    })
                    .attr("transform", "translate(" + width/2 + "," + height/2 +")")
                    .on('click', function () {
                        console.log(rebounds)
                    });
            }
        }

        function drawArc (innerR, outerR) {
            return d3.svg.arc()
                .innerRadius(innerR)
                .outerRadius(outerR)
                .startAngle(0)
                .endAngle(2 * Math.PI);
        }
    }

});