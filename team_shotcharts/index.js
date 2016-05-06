function draw(id,team) {
    d3.json("./data/"+ team +"_shots.json", function (error, data) {
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
            var grid_length = 28;

            var svg = d3.select('svg#'+id);
            svg.selectAll('.hexagon').remove();
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
                .domain([0.36, 0.5, 0.7])
                .range(['Gold', 'OrangeRed', 'red'])
                .interpolate(d3.interpolateLab);
            var grouped_location = {};
            var grouped_data = [];
            var points = [];
            var hexbin_sizes = [];
            var max_shot_num = 1;
            var min_shot_num = 100000;
            var total_shots = 0;
            var total_made = 0;
            for (i = 0; i < data.length; i++) {
                data[i].y = ((data[i].LOC_Y) * 1.1 + baseline_basket_dist);
                data[i].x = ((data[i].LOC_X) * 1.1 + width / 2);
                var key = data[i].x + ',' + data[i].y;
                total_shots += 1;
                total_made += data[i].SHOT_MADE_FLAG;
                if (grouped_location[key]) {
                    grouped_location[key]['shot_num'] += 1;

                    grouped_location[key]['shot_made_num'] += data[i].SHOT_MADE_FLAG;
                    if (data[i].SHOT_MADE_FLAG > 0) {
                        grouped_location[key]['points'] += Number(data[i].SHOT_TYPE[0]);
                    }
                    grouped_location[key]['total_shot_distance'] += data[i].SHOT_DISTANCE;
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
                    grouped_location[key]['total_shot_distance'] = data[i].SHOT_DISTANCE;
                    grouped_location[key]['points'] = data[i].SHOT_MADE_FLAG > 0 ? Number(data[i].SHOT_TYPE[0]) : 0;
                    grouped_location[key]['shot_made_num'] = data[i].SHOT_MADE_FLAG;
                    grouped_location[key]['shots'] = [data[i]]
                }
            }
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
                merged_data['total_shot_distance'] = 0;
                for (var k = 0; k < hexbin_points[i].length; k++) {
                    var key = hexbin_points[i][k][0] + ',' + hexbin_points[i][k][1];
                    merged_data['shot_num'] += grouped_location[key]['shot_num'];
                    merged_data['total_shot_distance'] += grouped_location[key]['total_shot_distance'];
                    merged_data['shot_made_num'] += grouped_location[key]['shot_made_num'];
                    merged_data['points'] += grouped_location[key]['points'];
                    merged_data['shots'] = merged_data['shots'].concat(grouped_location[key]['shots'])
                }
                merged_data['avg_shot_distance'] = merged_data['total_shot_distance']/merged_data['shot_num'];
                if (merged_data['avg_shot_distance'] > 7) {
                    max_shot_num = Math.max(merged_data['shot_num'], max_shot_num);
                    min_shot_num = Math.min(merged_data['shot_num'], min_shot_num);
                }
            }
            console.log(max_shot_num)
            var r = d3.scale.linear()
                .domain([min_shot_num, max_shot_num])
                .range([2, grid_length]);
            for (var i = 0; i < points_data.length; i++) {
                hexbin_sizes.push(points_data[i]['shot_num'])
            }
            function tip_for(name, num) {
                return "<strong>"+ name +": </strong><span style='color:red'>" + num + "</span></br>"
            }

            function color_for(pct) {
                var colors  = ["#0066FF","#5599EE","#AACCDD","#FFFFCC","#FFDBAF","#FFB692","#FF9275","#FF6D57","#FF493A","#FF241D","#FF0000"]
                if (pct < 0.2) {
                    return colors[0]
                } else if (pct < 0.25) {
                    return colors[1]
                } else if (pct < 0.30) {
                    return colors[2]
                } else if (pct < 0.36) {
                    return colors[3]
                } else if (pct < 0.4) {
                    return colors[4]
                } else if (pct < 0.43) {
                    return colors[5]
                } else if (pct < 0.46) {
                    return colors[6]
                } else if (pct < 0.5) {
                    return colors[7]
                } else if (pct < 0.55) {
                    return colors[8]
                } else if (pct < 0.6) {
                    return colors[9]
                } else {
                    return colors[10]
                }
            }
            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([60, 100])
                .html(function(d, i) {
                    var pct = tip_for("Percent",(points_data[i].shot_made_num * 100 / points_data[i].shot_num).toFixed(1) + "%");
                    var att = tip_for("Attempted", points_data[i].shot_num);
                    var made = tip_for("Made", points_data[i].shot_made_num);
                    var pts = tip_for("Points Per Attempt", (points_data[i].points/points_data[i].shot_num).toFixed(2));
                    var percent = tip_for("Attempted%", (points_data[i].shot_num * 100/total_shots).toFixed(1) + "%");
                    var distance = tip_for('Avg Distance', (points_data[i].avg_shot_distance).toFixed(0) + ' ft');
                    return pct + made + att + percent + pts + distance;
                });
            svg.call(tip);
            svg.append("g")
                .selectAll(".hexagon")
                .data(hexbin_points)
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
                    var pts = points_data[i].points/points_data[i].shot_num/2;
                    return color_for(pct);
                })
                .attr('fill-opacity', function (d, i) {
                    return 1;
                    return (1.5 * points_data[i].shot_made_num / points_data[i].shot_num) + 0.1
                })
                .on('click', function (d, i) {
                })
                .on('mouseover', function (d, i) {
                    d3.select(this).attr("fill", 'white');
                    tip.show(d, i);
                })
                .on('mouseout', function (d, i) {
                    d3.select(this).attr("fill", function () {
                        var pct = points_data[i].shot_made_num / points_data[i].shot_num;
                        var pts = points_data[i].points/points_data[i].shot_num/2;
                        return color_for(pct);
                    });
                    tip.hide(d, i);
                })

        }
    });
}

function drawCharts(team) {
    draw('svg-win', team + '_win');
    draw('svg-lose', team + '_lose');
    draw('svg-vs-win', 'vs_' + team + '_lose');
    draw('svg-vs-lose', 'vs_' + team + '_win');
}

function selectTeam(sel) {
    var team = sel.value;
    drawCharts(team);
}
