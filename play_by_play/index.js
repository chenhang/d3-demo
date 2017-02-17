function draw(file) {
    d3.csv("./data/" + file, function (error, data) {
        if (error) {
            console.log(error);
        } else {
            var color = function (d) {
                if (d.result == 'made') {
                    return 'red'
                } else {
                    return 'black'
                }
            };
            var svg = d3.select('svg');
            d3.selectAll('.circles').remove();
            d3.selectAll('select').remove();
            var teams = file.slice(9, 15);
            var groups = svg.append("g").attr("transform", "translate(" + 0 + "," + 0 + ")");
            var players = data.map(function (d) { return d.player; });
            players = Array.from(new Set(players)).filter(function (name) { return name });
            var x_for = function (d) {
                var index = teams.indexOf(d.team);
                if (index <= 0) {
                    return d.y * 10
                } else {
                    return 940 - d.y * 10
                }
            };
            var tip_content = function (name, value) {
                return "<strong>" + name + ": </strong><span style='color:red'>" + value + "</span></br>"
            }
            var tip_for = function (d, i) {
                var type = tip_content('Type', d.type);
                var player = tip_content('Player', d.player);
                var content = player + type;
                if (d.result == 'made') {
                    var points = tip_content('Points', d.points);
                    var assist = tip_content('Assist By', d.assist);
                    content += points + assist;
                } else {
                    var block = tip_content('Block By', d.block);
                    content += block;
                }
                return content;
            };

            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([20, 90])
                .html(tip_for);
            svg.call(tip);
            var circles =
                groups.selectAll("circle")
                    .data(data)
                    .enter().append("circle")
                    .filter(function (d) {
                        return d.x;
                    })
                    .attr("class", "circles")
                    .attr({
                        cx: function (d) {
                            return x_for(d);
                        },
                        cy: function (d) {
                            return d.x * 10;
                        },
                        r: 8
                    })
                    .style("fill", color)
                    .on('mouseover', function (d, i) {
                        var circle = d3.select(this);

                        circle.transition()
                            .duration(800).style("opacity", 1)
                            .attr("r", 16).ease("elastic");
                        tip.show(d, i);
                    })
                    .on('mouseout', function (d, i) {
                        var circle = d3.select(this);

                        circle.transition()
                            .duration(800).style("opacity", .9)
                            .attr("r", 8).ease("elastic");
                        tip.hide(d, i);
                    });
            var dropDown = d3.select("#filter").append("select")
                .attr("name", "player-list");

            var options = dropDown.selectAll("option")
                .data(["All"].concat(players))
                .enter()
                .append("option");
            options.text(function (d) { return d; })
                .attr("value", function (d) { return d; });
            dropDown.on("change", function() {
                var selected = this.value;
                displayOthers = this.checked ? "inline" : "none";
                display = this.checked ? "none" : "inline";

                if(selected == 'All'){
                    svg.selectAll(".circles")
                        .attr("display", display);
                }
                else{
                    svg.selectAll(".circles")
                        .filter(function(d) {return selected != d.player;})
                        .attr("display", displayOthers);

                    svg.selectAll(".circles")
                        .filter(function(d) {return selected == d.player;})
                        .attr("display", display);
                }
            });
        }
    });
}

var file = "20091027.BOSCLE.csv";
draw(file);