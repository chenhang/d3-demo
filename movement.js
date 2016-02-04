stats.controller("MovementCtrl", ["$scope", "$rootScope", "$location", "$element", "$http", "$filter", function ($scope, $rootScope, $location, $element, $http, $filter) {
    var animationFrame;
    var momentIndex = 0;
    var data;
    var players = {};
    var teams = {};
    var teamkeys = ["home", "visitor"];
    var xMin = 0;
    var xMax = 75;
    $scope.isPlaying = false;
    $scope.isLoading = true;
    $scope.noData = false;
    $scope.court = {margin: {top: 15, right: 30, bottom: 15, left: 30}, width: 940, height: 500, rotation: 40};
    $scope.playbackSpeeds = [{ms: 160, text: ".25x"}, {ms: 80, text: ".5x"}, {ms: 40, text: "1x"}, {
        ms: 20,
        text: "2x"
    }, {ms: 10, text: "4x"}];
    $scope.playbackSpeed = $scope.playbackSpeeds[2];
    $scope.svg = {
        elm: $element.find("svg"),
        width: $scope.court.width + $scope.court.margin.left + $scope.court.margin.right,
        height: $scope.court.height + $scope.court.margin.top + $scope.court.margin.bottom
    };
    $scope.svg.aspect = $scope.svg.height / $scope.svg.width;
    $scope.vtm = {players: [], hideCoverage: false};
    $scope.htm = {players: [], hideCoverage: false};
    $scope.ball = {};
    function parseData(data) {
        for (var i in teamkeys) {
            var key = teamkeys[i];
            var team = data[key];
            var teamid = team.teamid;
            teams[teamid] = team;
            teams[teamid].type = key;
            for (var j in team.players) {
                var player = team.players[j];
                var playerid = player.playerid;
                players[playerid] = player;
                player.name = player.firstname + " " + player.lastname;
                player.teamid = team.teamid;
                player.teamname = team.name;
                player.teamtype = team.type
            }
        }
        $scope.htm.team = data.home;
        $scope.vtm.team = data.visitor
    }

    function parseMoment(moment) {
        var i;
        var info = {
            period: moment[0],
            timestamp: moment[1],
            gameclock: moment[2],
            shotclock: moment[3],
            eventid: moment[4]
        };
        var ps = moment[5].map(function (n, i) {
            var obj = {teamid: n[0], playerid: n[1], x: n[2] * 10, y: n[3] * 10, z: n[4] * 10, hide: false};
            return obj
        });
        var obj = {info: info, ball: ps[0], htm: ps.slice(1, 6), vtm: ps.slice(6, 11)};
        for (i in obj.vtm) {
            obj.vtm[i].info = players[obj.vtm[i].playerid]
        }
        for (i in obj.htm) {
            obj.htm[i].info = players[obj.htm[i].playerid]
        }
        return obj
    }

    function getTeamHull(d) {
        return d3.geom.hull(d.map(function (i) {
            return [i.x, i.y]
        }))
    }

    function getBallRadius(z) {
        var r = z * .2;
        r = Math.min(Math.max(r, 10), 18);
        return r
    }

    function setTeamPlayerData(team, loc) {
        if ($scope[loc].players.length != team.length) {
            $scope[loc].players = team;
            return
        } else {
            for (var i in team) {
                var p = $scope[loc].players[i];
                var m = team[i];
                if (p && p.playerid == m.playerid) {
                    p.x = m.x;
                    p.y = m.y
                } else {
                    $scope[loc].players[i] = m
                }
            }
        }
        var visible = $filter("filter")($scope[loc].players, {hide: false});
        $scope[loc].hull = getTeamHull(visible);
        $scope[loc].path = "M" + $scope[loc].hull.join("L") + "Z";
        $scope[loc].area = d3.geom.polygon($scope[loc].hull).area();
        $scope[loc].coverage = $scope[loc].area / 2350
    }

    function onFrame(dontApply) {
        var moment = parseMoment(data.moments[momentIndex]);
        $scope.court.period = moment.info.period;
        $scope.court.gameclock = moment.info.gameclock;
        $scope.court.shotclock = moment.info.shotclock;
        setTeamPlayerData(moment.htm, "htm");
        setTeamPlayerData(moment.vtm, "vtm");
        $scope.ball.x = moment.ball.x;
        $scope.ball.y = moment.ball.y;
        $scope.ball.r = getBallRadius(moment.ball.z);
        if (!dontApply) {
            $scope.$apply()
        }
        momentIndex += 1;
        if (momentIndex >= data.moments.length) {
            $scope.pause();
            broadcastFinished(true)
        }
    }

    function broadcastFinished(shouldDigest) {
        $scope.stop();
        $scope.$emit("finishedPlaying", shouldDigest)
    }

    $scope.rewind = function () {
        momentIndex = 0;
        clearInterval(animationFrame);
        onFrame(true)
    };
    $scope.forward = function () {
        momentIndex = data.moments.length - 1;
        clearInterval(animationFrame);
        onFrame(true)
    };
    $scope.pause = function () {
        $scope.isPlaying = false;
        clearInterval(animationFrame);
        return false
    };
    $scope.stop = function () {
        $scope.isPlaying = false;
        momentIndex = 0;
        clearInterval(animationFrame);
        return false
    };
    $scope.play = function () {
        $scope.isPlaying = true;
        if (momentIndex == data.moments.length) {
            momentIndex = 0
        }
        clearInterval(animationFrame);
        animationFrame = setInterval(onFrame, $scope.playbackSpeed.ms);
        return false
    };
    $scope.stepbackward = function () {
        momentIndex = momentIndex > 0 ? momentIndex - 2 : momentIndex;
        if (momentIndex < 0) {
            momentIndex = 0
        }
        clearInterval(animationFrame);
        onFrame(true)
    };
    $scope.stepforward = function () {
        momentIndex = momentIndex < data.moments.length - 1 ? momentIndex + 1 : data.moments.length - 1;
        clearInterval(animationFrame);
        onFrame(true)
    };
    $scope.getFeed = function (params) {
        var url = "/stats/locations_getmoments/";
        $scope.isLoading = true;
        momentIndex = 0;
        $http({method: "GET", url: url, params: params}).success(function (response, status) {
            data = response;
            if (data.moments.length === 0) {
                console.log("no data in momments array", params);
                $scope.noData = true;
                $scope.isLoading = false;
                broadcastFinished();
                return
            }
            parseData(data);
            $scope.isLoading = false;
            momentIndex = 0;
            $scope.play();
            setTimeout(onResize, 100)
        }).error(function (response, status) {
            console.log("error", response, status);
            $scope.noData = true;
            $scope.isLoading = false;
            broadcastFinished()
        })
    };
    $scope.$watch("selectedItem", function (item) {
        if (!item || !item.ei || !item.gi) {
            return
        }
        $scope.description = item.dsc;
        var params = {gameid: item.gi, eventid: item.ei};
        $scope.getFeed(params)
    });
    if ($location.search().GameEventID) {
        var params = {gameid: $location.search().GameID, eventid: $location.search().GameEventID};
        $scope.getFeed(params)
    }
    var onResize = function () {
        var width = $scope.svg.elm.width();
        $scope.svg.elm.attr("width", width);
        $scope.svg.elm.attr("height", width * $scope.svg.aspect)
    };
    setTimeout(onResize, 100);
    $(window).resize(onResize)
}]);
