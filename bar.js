d3.json("pitches.json", function(error, data) {
    if (error) {
        console.log(error);
    } else {
        var dataset = data.slice(0, 70)
        var count = dataset.length + 1;
        var updatePeriod = 500;
        var transitionTime = 1000;

        setInterval(function() {
            dataset.shift();
            dataset.push(data[count]);
            count++;
            if (count >= data.length) {
                count = 0
            };
            redraw();
            d3.timer.flush();
        }, updatePeriod);

        var w = 10;
        var h = 200;
        var x = d3.scale.linear()
            .domain([0, 1])
            .range([0, w]);
        var y = d3.scale.linear()
            .domain([0, 1])
            .rangeRound([0, h]);

        var chart = d3.select("body").append("svg")
            .attr("class", "chart")
            .attr("width", w * dataset.length - 1)
            .attr("height", h);
        var rect = chart.selectAll("rect")
            .data(dataset)
            .enter().append("rect")
            .attr("x", function(d, i) {
                return x(i) - .5
            })
            .attr("y", function(d) {
                return h - y(d) - .5
            })
            .attr("width", w)
            .attr("height", function(d) {
                return y(d)
            })
            .attr("stroke", "white")
            .attr("fill", function(d, i) {
                return "rgb(102," + Math.round(d * 255) + ",255)"
            })
            .attr("opacity", function(d, i) {
                return 1 - i / dataset.length
            })
            .on("mouseover", function(d) {
                console.log(d);
            });


        chart.append("line")
            .attr("x1", 0)
            .attr("x2", w * dataset.length)
            .attr("y1", h - .5)
            .attr("y2", h - .5)
            .attr("stroke", "#000");

        function redraw() {
            var rect = chart.selectAll("rect")
                .data(dataset)
                .transition()
                .duration(transitionTime)
                .attr("y", function(d) {
                    return h - y(d) - .5;
                })
                .attr("height", function(d) {
                    return y(d);
                })
                .attr("fill", function(d) {
                    return "rgb(102," + Math.round(d * 255) + ",255)"
                })
                .attr("opacity", function(d, i) {
                    return 1 - i / dataset.length
                });
        }

    }
});