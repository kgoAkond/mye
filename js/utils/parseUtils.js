angular.module('MYE').service('parseUtils', [function () {
        return {
            parseSrt: function parseSrt(srt) {
                try {
                    var myeJson = [];
                    var srtArr = srt.split(/\n\n/);
                    for (var i = 0; i < srtArr.length; i++) {
                        var p = srtArr[i].split(/\n/);
                        if (p.length === 4) {
                            var entity = {
                                textSrc: p[2],
                                textTarget: p[3],
                            }
                            parseTime(entity, p[1]);
                            myeJson.push(entity);
                        } else {
                            console.log("Wrong part: ", p[i]);
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
                return myeJson;
            },
            joinText: function (arr, startInd) {
                var txt = "";
                for (var i = startInd; i < arr.length; i++) {
                    var t = arr[i].trim();
                    if (t === "") {
                        break;
                    }
                    txt += t + " ";
                }
                return {text: txt, ind: i};
            },
            parseVtt: function (vtt) {
                try {
                    var myeJson = [];
                    var state = 0;
                    var arr = vtt.split(/\n/);
                    for (var i = 0; i < arr.length; i++) {
                        var line = arr[i].trim();
                        if (line === "") {
                            state = 1;
                            continue;
                        }
                        if (state === 1) {
                            var entity = {items: []};
                            if (parseTime(entity, line)) {
                                myeJson.push(entity);
                                var t = joinText(arr, i + 1);
                                entity.text = t.text;
                                i = t.ind;
                            }
                        }

                    }
                } catch (e) {
                    console.log(e);
                }
                return myeJson;
            },
            convertToTime: function (time) {
                var s = time.split(":");
                var t = parseInt(s[0]) * 3600 + parseInt(s[1]) * 60 + parseFloat(s[2].replace(',', '.'));
                return t;
            },
            parseTime: function (entity, str) {
                var s = str.split("-->")
                if (s.length === 2) {
                    entity.timeStart = convertToTime(s[0].trim());
                    entity.timeEnd = convertToTime(s[1].trim());
                    return true;
                }
                return false;
            },
            score: function (pl, en) {
                if (pl.timeEnd > en.timeStart && pl.timeStart < en.timeEnd) {
                    var spnaPL = pl.timeEnd - pl.timeStart;
                    var spnaEN = en.timeEnd - en.timeStart;
                    return Math.min(pl.timeEnd, en.timeEnd) - Math.max(en.timeStart, pl.timeStart);
                } else if (pl.timeStart > en.timeEnd) {
                    return en.timeEnd - pl.timeStart
                } else {
                    return pl.timeEnd - en.timeStart;
                }
                return 0;

            },
            indexVtt: function (arr) {
                var hist = [];

                for (var i = 0; i < arr.length; i++) {
                    var t = arr[ i ];
                    var w = getWords(t.text);
                    for (var k = 0; k < w.length; k++) {
                        if (hist[ w[k] ]) {
                            hist[ w[k] ]++;
                        } else {
                            hist[ w[k] ] = 0;
                        }
                    }
                }
            },
            margeVtt: function () {
                var lastJ = 0;
                for (var i = 0; i < $scope.vttPL.length; i++) {
                    var pl = $scope.vttPL[ i ];
                    var sOld = false;
                    var enFit;
                    for (var j = lastJ; j < $scope.vttEN.length; j++) {
                        var en = $scope.vttEN[ j ];
                        var s = score(pl, en);
                        if (sOld) {
                            if (s >= sOld) {
                                enFit = en;
                                sOld = s;
                            } else {
                                enFit.items.push(pl);
                                break;
                            }
                        } else {
                            sOld = s;
                            enFit = en;
                        }


                    }
                }
            }
        }
    }]);

