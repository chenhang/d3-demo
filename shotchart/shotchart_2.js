d3.json("../sample_data/detail_shot_info/201566.json", function (error, data) {
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
        var three_points_line_sideline_dist = 0.9 * 32.8;
        var side_three_points_line_length = (4.27 + 1.5) * 32.8;
        var baseline_basket_dist = 5.24 * 10;
        var three_points_line_radius = 7.24 * 32.8;
        var grid_length = 18;

        var svg = d3.select('svg');
        var x = d3.scale.quantize()
            .domain([-width / 2, width / 2])
            .range(d3.range(-width / 2, width / 2, grid_length * Math.sqrt(3) / 2));

        var y = d3.scale.quantize()
            .domain([-height, height])
            .range(d3.range(-height, height, grid_length));

        var hot_color = d3.scale.linear()
            .domain([0.4, 0.8])
            .range(['rgb(50,0,0)', 'rgb(125,0,0)', 'rgb(255,0,0)'].reverse())
            .interpolate(d3.interpolateLab);
        var cold_color = d3.scale.linear()
            .domain([0, 0.4])
            .range(['rgb(0,50,0)', 'rgb(0,125,0)', 'rgb(0,255,0)'].reverse())
            .interpolate(d3.interpolateLab);
        var color_scale = d3.scale.linear()
            .domain([0.1, 0.4, 0.6])
            .range(['steelBlue', 'orange', 'red'])
            .interpolate(d3.interpolateLab);
        var grouped_location = {};
        var grouped_data = [];
        var points = [];
        var hexbin_sizes = [];
        var max_shot_num = 1;
        for (i = 0; i < data.length; i++) {
            data[i].y = ((data[i].loc_y) * 1.1 + baseline_basket_dist);
            data[i].x = ((data[i].loc_x) * 1.1 + width / 2);
            var key = data[i].x + ',' + data[i].y;
            if (grouped_location[key]) {
                grouped_location[key]['shot_num'] += 1;
                grouped_location[key]['shot_made_num'] += data[i].shot_made_flag;
                grouped_location[key]['points'] += data[i].pts;
                grouped_location[key]['shots'].push(data[i])
            }
            else {
                grouped_location[key] = {};
                grouped_data.push(grouped_location[key]);
                points.push([data[i].x, data[i].y]);
                grouped_location[key]['index'] = grouped_data.length;
                grouped_location[key]['x'] = data[i].x;
                grouped_location[key]['y'] = data[i].y;
                grouped_location[key]['shot_num'] = 1;
                grouped_location[key]['points'] = data[i].pts;
                grouped_location[key]['shot_made_num'] = data[i].shot_made_flag;
                grouped_location[key]['shots'] = [data[i]]
            }
            max_shot_num = Math.max(grouped_location[key]['shot_num'], max_shot_num);
        }
        var r = d3.scale.linear()
            .domain([0, max_shot_num])
            .range([0, grid_length + max_shot_num]);
        var shot_num = d3.scale.quantize()
            .domain([1, max_shot_num])
            .range(d3.range(grid_length / 2, grid_length, 2));
        var hexbin = d3.hexbin()
            .radius(grid_length);
        var hexbin_points = hexbin(points);
        var points_data = [];
        for (var i = 0; i < hexbin_points.length; i++) {
            var merged_data = {};
            points_data.push(merged_data);
            merged_data['shot_num'] = 0;
            merged_data['shot_made_num'] = 0;
            merged_data['points'] = 0;
            merged_data['shots'] = [];
            for (var k = 0; k < hexbin_points[i].length; k++) {
                var key = hexbin_points[i][k][0] + ',' + hexbin_points[i][k][1];
                merged_data['shot_num'] += grouped_location[key]['shot_num'];
                merged_data['shot_made_num'] += grouped_location[key]['shot_made_num'];
                merged_data['points'] += grouped_location[key]['points'];
                merged_data['shots'] = merged_data['shots'].concat(grouped_location[key]['shots'])

            }
        }
        for (var i = 0; i < points_data.length; i++) {
            hexbin_sizes.push(points_data[i]['shot_num'])
        }
        function tip_for(name, num) {
            return "<strong>"+ name +": </strong><span style='color:red'>" + num + "</span></br>"
        }
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([40, 80])
            .html(function(d, i) {
                var pct = tip_for("Percent",(points_data[i].shot_made_num * 100 / points_data[i].shot_num).toFixed(1) + "%");
                var att = tip_for("Attempted", points_data[i].shot_num);
                var made = tip_for("Made", points_data[i].shot_made_num);
                var pts = tip_for("Points Per Attempt", (points_data[i].points/points_data[i].shot_num).toFixed(2));

                return pct + made + att + pts;
            });
        svg.call(tip);
        svg.append("g")
            .selectAll(".hexagon")
            .data(hexbin(points))
            .enter().append("path")
            .attr("class", "hexagon")
            .attr("d", function (d, i) {
                return "M" + (d.x) + "," + (d.y) + hexbin.hexagon(Math.min(r(hexbin_sizes[i]), grid_length));
            })
            .attr("stroke", function (d, i) {
                return "#fff";
            })
            .attr("stroke-width", function (d, i) {
                return 0
            })
            .attr("fill", function (d, i) {
                var pct = points_data[i].shot_made_num / points_data[i].shot_num;
                return color_scale(pct);
            })
            .attr('fill-opacity', function (d, i) {
                //return 0.9;
                return (1.5 * points_data[i].shot_made_num / points_data[i].shot_num) + 0.1
            })
            .on('click', function (d, i) {
                var shots_num = points_data[i].shots.length;
                var threept_num = 0.0;
                for (var k = 0; k < points_data[i].shots.length; k++) {
                    var isDunk = points_data[i].shots[k].action_type.indexOf('Dunk') > -1;
                    var is3PT = points_data[i].shots[k].pts_type == 3 || points_data[i].shots[k].shot_type[0] == 3
                    if (is3PT) {
                        threept_num++;
                    }
                }
                //console.log(threept_num / shots_num);
            })
            .on('mouseover', function (d, i) {
                d3.select(this).attr("stroke-width", 5);
                tip.show(d, i);
            })
            .on('mouseout', function (d, i) {
                d3.select(this).attr("stroke-width", 0);
                tip.hide(d, i);
            })

    }
});