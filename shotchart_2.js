d3.json("./sample_data/detail_shot_info/201566.json", function (error, data) {
    if (error) {
        console.log(error);
    } else {
        var margin = {
            top: 50,
            right: 20,
            bottom: 20,
            left: 20
        };
        var height = 94 / 2 * 10;
        var width = 50 * 10;
        var three_points_line_sideline_dist = 0.9 * 32.8
        var side_three_points_line_length = (4.27 + 1.5) * 32.8
        var baseline_basket_dist = 5.24 * 10;
        var three_points_line_radius = 7.24 * 32.8
        var grid_length = 15
        var radius = grid_length

        //var svg = d3.select('body')
        //    .append('svg')
        //    .attr("width", width + margin.left + margin.left)
        //    .attr("height", height)
        //    .style("background-color", 'black')
        //    .append("g")
        //    .attr("transform", "translate(" + margin.left + "," + baseline_basket_dist + ")")
        var svg = d3.select('svg');
        //var court = svg.append('rect')
        //    .attr('class', 'court_base')
        //    .attr("x", -grid_length / 2)
        //    .attr("y", -baseline_basket_dist)
        //    .attr("width", width + grid_length)
        //    .attr("height", height)
        //    .attr("stroke", 'white')
        //    .attr("stroke-width", 1)


        //var start_angle = 110/180 * Math.PI;
        //var end_angle =  250/180 * Math.PI;
        //
        //var points = 50;
        //
        //var angle = d3.scale.linear()
        //    .domain([0, points - 1])
        //    .range([start_angle, end_angle]);
        //
        //var line = d3.svg.line.radial()
        //    .interpolate("basis")
        //    .tension(0)
        //    .radius(three_points_line_radius)
        //    .angle(function (d, i) {
        //        return angle(i);
        //    });
        //
        //var three_line = svg.append("path").datum(d3.range(points))
        //    .attr("class", "line")
        //    .attr("d", line)
        //    .attr("transform", "translate(" + (width / 2) +
        //    ", " + (baseline_basket_dist) + ")")
        //    .attr("stroke", 'white')
        //    .attr("stroke-width", 1)
        //
        //var three_points_side_line_left = svg.append("line")
        //    .attr('class', 'three_points_side_line_left')
        //    .attr("x1", three_points_line_sideline_dist)
        //    .attr("y1", -baseline_basket_dist)
        //    .attr("x2", three_points_line_sideline_dist)
        //    .attr("y2", side_three_points_line_length - baseline_basket_dist)
        //    .attr("stroke", 'white')
        //    .attr("stroke-width", 1)
        //var three_points_side_line_right = svg.append("line")
        //    .attr('class', 'three_points_side_line_right')
        //    .attr("x1", width - three_points_line_sideline_dist)
        //    .attr("y1", -baseline_basket_dist)
        //    .attr("x2", width - three_points_line_sideline_dist)
        //    .attr("y2", side_three_points_line_length - baseline_basket_dist)
        //    .attr("stroke", 'white')
        //    .attr("stroke-width", 1)
        var x = d3.scale.quantize()
            .domain([-width / 2, width / 2])
            .range(d3.range(-width / 2, width / 2, grid_length * Math.sqrt(3) / 2));

        var y = d3.scale.quantize()
            .domain([-height, height])
            .range(d3.range(-height, height, grid_length));

        var hot_color = d3.scale.linear()
            .domain([0.4, 0.8])
            .range(['rgb(0,50,0)', 'rgb(0,125,0)', 'rgb(0,255,0)'].reverse())
            .interpolate(d3.interpolateLab);
        var cold_color = d3.scale.linear()
            .domain([0.1, 0.4])
            .range(['rgb(50,50,50)', 'rgb(125,125,125)', 'rgb(255,255,255)'].reverse())
            .interpolate(d3.interpolateLab);
        var grouped_location = {};
        var grouped_data = [];
        var points = [];
        var hexbin_sizes = [];
        var max_shot_num = 1;
        for (i = 0; i < data.length; i++) {
            //console.log('original:'+data[i].loc_y)
            //console.log('after:'+y(data[i].loc_y))
            data[i].y = (x(data[i].loc_y) * 1.1 + baseline_basket_dist)
            data[i].x = (y(data[i].loc_x) * 1.1 + width / 2)
            var key = data[i].x + ',' + data[i].y;
            if (data[i].shot_type[0] == 3) {
                //console.log('a')
            }
            if (grouped_location[key]) {
                grouped_location[key]['shot_num'] += 1;
                grouped_location[key]['shot_made_num'] += data[i].shot_made_flag;
                grouped_location[key]['shots'].push(data[i])
            }
            else {
                grouped_location[key] = {}
                grouped_data.push(grouped_location[key])
                points.push([data[i].x, data[i].y])
                grouped_location[key]['index'] = grouped_data.length
                grouped_location[key]['x'] = data[i].x
                grouped_location[key]['y'] = data[i].y
                grouped_location[key]['shot_num'] = 1;
                grouped_location[key]['shot_made_num'] = data[i].shot_made_flag
                grouped_location[key]['shots'] = [data[i]]
            }
            max_shot_num = Math.max(grouped_location[key]['shot_num'], max_shot_num);
        }
        var r = d3.scale.linear()
            .domain([0, max_shot_num])
            .range([1, grid_length+ max_shot_num])
        var shot_num = d3.scale.quantize()
            .domain([1, max_shot_num])
            .range(d3.range(grid_length / 2, grid_length, 2));
        var hexbin = d3.hexbin()
            .radius(grid_length);
        var hexbin_points = hexbin(points)
        var points_data = []
        for (var i = 0; i < hexbin_points.length; i++) {
            var merged_data = {}
            points_data.push(merged_data)
            merged_data['shot_num'] = 0
            merged_data['shot_made_num'] = 0
            merged_data['shots'] = []
            for (var k = 0; k < hexbin_points[i].length; k++) {
                var key = hexbin_points[i][k][0] + ',' + hexbin_points[i][k][1];
                merged_data['shot_num'] += grouped_location[key]['shot_num']
                merged_data['shot_made_num'] += grouped_location[key]['shot_made_num']
                merged_data['shots'] = merged_data['shots'].concat(grouped_location[key]['shots'])

            }
        }
        for (var i = 0; i < points_data.length; i++) {
            hexbin_sizes.push(points_data[i]['shot_num'])
        }
        svg.append("g")
            .selectAll(".hexagon")
            .data(hexbin(points))
            .enter().append("path")
            .attr("class", "hexagon")
            .attr("d", function (d, i) {
                return "M" + d.x + "," + d.y + hexbin.hexagon(Math.min(r(hexbin_sizes[i]), grid_length - 2));
            })
            .attr("stroke", function (d, i) {
                return "#fff";
            })
            .attr("stroke-width", function (d, i) {
                return 1
            })
            .attr("fill", function (d, i) {
                var pct = points_data[i].shot_made_num / points_data[i].shot_num
                if (pct >= 0.4)
                    return hot_color(pct)
                else
                    return cold_color(pct)
            })
            .attr('fill-opacity', function (d, i) {
                return 1;
                return (1.5 * points_data[i].shot_made_num / points_data[i].shot_num) + 0.1
            })
            .on('click', function (d, i) {
                var shots_num = points_data[i].shots.length;
                var threept_num = 0.0
                for (var k = 0; k < points_data[i].shots.length; k++) {
                    var isDunk = points_data[i].shots[k].action_type.indexOf('Dunk') > -1
                    var is3PT = points_data[i].shots[k].pts_type == 3 || points_data[i].shots[k].shot_type[0] == 3
                    if (is3PT) {
                        threept_num++;
                    }
                }
                console.log(threept_num/shots_num)
            })
    }
});