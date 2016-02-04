d3.json("movement.json", function(error, data) {
    if (error) {
        console.log(error);
    } else {
        var width = 1276;
        var height = 676;
        var updatePeriod = 15;
        var transitionTime = 15;
        var datasets = parseData(data).moments;
        var index = 1;
        var dataset = datasets[0];
        var home = dataset.home;
        var visitor = dataset.visitor;
        var ball = [dataset.ball];

        var svg = d3.select('body')
            .append('svg')
            .attr({
                width: width,
                height: height,
            });
        console.log(dataset)

        var homePlayers = newPoint(home, 'home');
        homePlayers.attr('fill', 'orange')

        var visitorPlayers = newPoint(visitor, 'visitor');
        visitorPlayers.attr('fill', 'steelBlue')

        var ball = newPoint(ball, 'ball', 15);
        ball.attr('fill', 'green');

        function newPoint(data, className, r) {
            var point = svg.selectAll('.dataCircle')
                .data(data)
                .enter()

            var circle = point.append('circle')
                .attr('cx', function(d, i) {
                    return d.x;
                })
                .attr('cy', function(d, i) {
                    return d.y;
                })
                .attr('stroke', 'grey')
                .attr('stroke-width', r / 4 || 5)
                .attr('r', r || 20)
                .classed(className, true)

            var text = svg.selectAll('.dataText')
                .data(data)
                .enter()
                .append('text')
                .attr('x', function(d, i) {
                    return d.x - (r/2 || 10);
                })
                .attr('y', function(d, i) {
                    return d.y + (r/2 || 10);
                })
                .text('00')
                .classed(className+'-text', true)


            return circle;
        }

        function movePoints(data, className) {
            var point = svg.selectAll("." + className)
                .data(data)
                .transition()
                .duration(transitionTime)
                .attr('cx', function(d, i) {
                    return d.x;
                })
                .attr('cy', function(d, i) {
                    return d.y;
                })

            var text = svg.selectAll('.'+className+'-text')
                .data(data)
                .transition()
                .duration(transitionTime)
                .attr('x', function(d, i) {
                    return d.x - 10;
                })
                .attr('y', function(d, i) {
                    return d.y + 10;
                })
        }

        setInterval(function() {
            dataset = datasets[index];
            home = dataset.home;
            visitor = dataset.visitor;
            ball = [dataset.ball];

            movePoints(home, 'home');
            movePoints(visitor, 'visitor');
            movePoints(ball, 'ball');

            index++;
            d3.timer.flush();
            if (index >= datasets.length) {
                index = 0
            };
        }, updatePeriod);

        function playerClassed(select) {
            select.classed('ball', true);
        }

        function parseData(data) {
            data.teams = {};
            data.players = {};
            var teamkeys = ["home", "visitor"];
            for (var i in teamkeys) {
                var key = teamkeys[i];
                var team = data[key];
                var teamid = team.teamid;
                data.teams[teamid] = team;
                data.teams[teamid].type = key;
                for (var j in team.players) {
                    var player = team.players[j];
                    player.name = player.firstname + " " + player.lastname;
                    player.teamid = team.teamid;
                    player.teamname = team.name;
                    player.teamtype = team.type;
                    data.players[player.playerid] = player
                }
            }
            data.moments = data.moments.map(parseMoment.bind(data));
            return data
        }

        function parseMoment(moment, index) {
            var i;
            var info = {
                period: moment[0],
                timestamp: moment[1],
                gameclock: moment[2],
                shotclock: moment[3],
                eventid: moment[4]
            };
            var ps = moment[5].map(function(n, i) {
                var obj = {
                    teamid: n[0],
                    playerid: n[1],
                    x: n[2] * 10,
                    y: n[3] * 10,
                    z: n[4] * 10,
                    hide: false
                };
                return obj
            });
            var obj = {
                info: info,
                ball: ps[0],
                home: ps.slice(1, 6),
                visitor: ps.slice(6, 11)
            };
            return obj
        }
    }
});