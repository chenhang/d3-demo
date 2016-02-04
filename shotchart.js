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
        var height = 28.65 * 32.8 / 2;
        var width = 15.24 * 32.8;
        var three_points_line_sideline_dist = 0.9 * 32.8
        var side_three_points_line_length = (4.27 + 1.5) * 32.8
        var baseline_basket_dist = 1.6 * 32.8
        var three_points_line_radius = 7.24 * 32.8
        var grid_length = 20
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
        //    .attr("x", - grid_length / 2)
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
            .domain([-width/2, width/2])
            .range(d3.range(-width/2, width/2, grid_length));

        var y = d3.scale.quantize()
            .domain([-height, height])
            .range(d3.range(-height, height, grid_length));

        var grouped_location = {}
        var grouped_data = []
        var max_shot_num = 1;
        var min_shot_num = 1;
        for (i = 0; i < data.length; i++) {
            data[i].x = (x(data[i].loc_x)  + width / 2) * 1
            data[i].y = (y(data[i].loc_y)  + baseline_basket_dist) * 1
            var key = data[i].x + '' + data[i].y
            if (grouped_location[key]) {
                grouped_location[key]['shot_num'] += 1;
                grouped_location[key]['shot_made_num'] += data[i].shot_made_flag
                grouped_location[key]['shots'].push(data[i])
            }
            else {
                grouped_location[key] = {}
                grouped_data.push(grouped_location[key])
                grouped_location[key]['index'] = grouped_data.length
                grouped_location[key]['x'] = data[i].x
                grouped_location[key]['y'] = data[i].y
                grouped_location[key]['shot_num'] = 1;
                grouped_location[key]['shot_made_num'] = data[i].shot_made_flag
                grouped_location[key]['shots'] = [data[i]]
            }
            max_shot_num = Math.max(grouped_location[key]['shot_num'], max_shot_num);
            min_shot_num = Math.min(grouped_location[key]['shot_num'], min_shot_num);
        }

        var r = d3.scale.linear()
            .domain([min_shot_num, max_shot_num])
            .range([grid_length / 4, grid_length/2])
        var hot_color = d3.scale.linear()
            .domain([0.4, 0.8])
            .range(['rgb(50,0,0)', 'rgb(125,0,0)', 'rgb(255,0,0)'].reverse())
            .interpolate(d3.interpolateLab);
        var cold_color = d3.scale.linear()
            .domain([0.1, 0.4])
            .range(['rgb(0,0,50)', 'rgb(0,0,125)', 'rgb(0,0,255)'].reverse())
            .interpolate(d3.interpolateLab);
        var shotchart = svg.selectAll('.dataCircle')
            .data(grouped_data)
            .enter()
            .append('circle')
            .attr('cx', function (d) {
                return (d.x);
            })
            .attr('cy', function (d) {
                return (d.y);
            })
            .attr('fill', function (d) {
                var pct = d.shot_made_num / d.shot_num
                if (pct >= 0.4)
                    return hot_color(pct)
                else
                    return cold_color(pct)
            })
            .attr('r', function (d, i) {
                return Math.min(radius / 2, r(d.shot_num))
            })
            .attr('fill-opacity', function (d) {
                return 1
                return (1.5 * d.shot_made_num / d.shot_num) + 0.1
            })
            .on('click', function (d, i) {
                //console.log(grouped_data[i].shots)
                console.log('3pt')
                for (var k = 0; k < grouped_data[i].shots.length; k++) {
                    var isDunk = grouped_data[i].shots[k].action_type.indexOf('Dunk') > -1
                    var is3PT = grouped_data[i].shots[k].pts_type == 3 || grouped_data[i].shots[k].shot_type[0] == 3
                    //console.log('type')
                    //console.log(grouped_data[i].shots[k].pts_type)
                    //console.log(grouped_data[i].shots[k].loc_y)
                    if (is3PT) {
                        console.log(grouped_data[i].shots[k])
                    }
                }
                console.log('3pt end')
            });

    }
});