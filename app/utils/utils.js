angular.module('MYE').service('utils', ['$http', function ($http) {
        function parseTime(entity, str) {
            var s = str.split("-->")
            if (s.length === 2) {
                entity.timeStart = convertToTime(s[0].trim());
                entity.timeEnd = convertToTime(s[1].trim());
                return true;
            }
            return false;
        }
        function joinText(arr, startInd) {
            var txt = "";
            for (var i = startInd; i < arr.length; i++) {
                var t = arr[i].trim();
                if (t === "") {
                    break;
                }
                txt += t + " ";
            }
            return {text: txt, ind: i};
        }
        function convertToTime(time) {
            var s = time.split(":");
            var t = parseInt(s[0]) * 3600 + parseInt(s[1]) * 60 + parseFloat(s[2].replace(',', '.'));
            return t;
        }
        return {
            loadJson: function (filename, callback) {
                $http.get(filename).then(function successCallback(response) {
                    var json = response.data;
                    callback(json);
                }, function errorCallback(response) {
                    console.log("ERROR DURING LOAD FILES");
                });
            },
            speechText: function (text, lang) {
                var msg = new SpeechSynthesisUtterance(text);
                msg.lang = lang;
                window.speechSynthesis.speak(msg);
            },
            parseVtt: function(vtt) {
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
        }
    }]);