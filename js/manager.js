angular.module('MYE', ['ngMaterial', 'ngMessages', 'ngAnimate']).controller('managerCtr', ['$scope', '$http', 'MyeEditor', function ($scope, $http, MyeEditor) {

        $scope.isInitialized = false;
        $scope.data = [];
        $scope.vttEN = [];
        $scope.vttPL = [];
        $scope.tedUrl = "";
        //$scope.videoUrl = "https://download.ted.com/talks/LaurenSallan_2017U.mp3";
        $scope.videoUrl = "https://download.ted.com/talks/LaurenSallan_2017U-480p.mp4";
        $scope.vttEnUrl = "https://hls.ted.com/talks/3587/subtitles/pl/full.vtt";
        $scope.vttPlUrl = "https://hls.ted.com/talks/3587/subtitles/en/full.vtt";
        
        $scope.loadTED = function( url ) {
            $http.get(url).then(function successCallback(response) {
                console.log(response.data);
                var args = response.data;
                    $scope.tedId = args.id;
                    $scope.tedMovieId = args.movieId;
                    $scope.videoUrl = "https://download.ted.com/talks/" + $scope.tedMovieId + "-480p.mp4";
                    $scope.vttEnUrl = "https://hls.ted.com/talks/" + $scope.tedId + "/subtitles/pl/full.vtt";
                    $scope.vttPlUrl = "https://hls.ted.com/talks/" + $scope.tedId + "/subtitles/en/full.vtt";
                    $scope.loadVideo();
                    $scope.loadVttEN( $scope.vttEnUrl );
                    $scope.loadVttPL( $scope.vttPlUrl );
                
            }, function errorCallback(response) {
                console.log("ERROR DURING LOAD TED");
            });
        }
        function parseSrt(srt) {
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
        }
        $scope.loadVideo = function () {
            $scope.video = document.getElementById("vPlayer");
            document.getElementById("movieSource").src = $scope.videoUrl;
            $scope.video.addEventListener('timeupdate', handlePlay, false);
            $scope.video.load();
        }
        function handleVideoBtnChange(evt) {
            var f = evt.target.files[0];
            $scope.video = document.getElementById("vPlayer");
            var filenameVideo = URL.createObjectURL(f);
            document.getElementById("movieSource").src = filenameVideo;
            $scope.video.addEventListener('timeupdate', handlePlay, false);
            $scope.video.load();
        }
        function handleSrtBtnChange(evt) {
            var f = evt.target.files[0];
            var url = URL.createObjectURL(f);
            $http.get(url).then(function successCallback(response) {
                console.log(response.data);
                $scope.data = parseSrt(response.data);
                $scope.isInitialized = true;
            }, function errorCallback(response) {
                console.log("ERROR DURING LOAD FILES");
            });
        }

        function handleVttBtnENChange(evt) {
            var f = evt.target.files[0];
            var url = URL.createObjectURL(f);
            $http.get(url).then(function successCallback(response) {
                MyeEditor.loadEN(response.data);
                $scope.vttEN = MyeEditor.vttEN;
                $scope.isENLoaded = true;
            }, function errorCallback(response) {
                console.log("ERROR DURING LOAD FILES");
            });
        }
        function handleVttBtnPLChange(evt) {
            var f = evt.target.files[0];
            var url = URL.createObjectURL(f);
            $http.get(url).then(function successCallback(response) {
                MyeEditor.loadPL(response.data);
                $scope.vttPL = MyeEditor.vttPL;
                $scope.isPLLoaded = true;
            }, function errorCallback(response) {
                console.log("ERROR DURING LOAD FILES");
            });
        }
        $scope.loadVttEN = function( url ) {
            $http.get(url).then(function successCallback(response) {
                MyeEditor.loadEN(response.data);
                $scope.vttEN = MyeEditor.vttEN;
                $scope.isENLoaded = true;
            }, function errorCallback(response) {
                console.log("ERROR DURING LOAD FILES");
            });
        }
        $scope.loadVttPL = function( url ) {
            $http.get(url).then(function successCallback(response) {
                MyeEditor.loadPL(response.data);
                $scope.vttPL = MyeEditor.vttPL;
                $scope.isPLLoaded = true;
            }, function errorCallback(response) {
                console.log("ERROR DURING LOAD FILES");
            });
        }
        function refresh() {
            $scope.isENLoaded = false;
            $scope.isPLLoaded = false;
            setTimeout(function () {
                $scope.isENLoaded = true;
                $scope.isPLLoaded = true;
                $scope.$apply();
            }, 0)
        }

 
        $scope.marge = function () {
                       
            MyeEditor.marge();            
            refresh();
        }

        this.$onInit = function () {
            $('#videoBtn').on('change', handleVideoBtnChange);
            $('#srtBtn').on('change', handleSrtBtnChange);
            $('#vttBtnEN').on('change', handleVttBtnENChange);
            $('#vttBtnPL').on('change', handleVttBtnPLChange);
        }
        $scope.speechSrc = function (item) {
            $scope.video.pause();
            $scope.video.currentTime = item.timeStart;
            $scope.currentItem = item;
            $scope.video.play();
            /*
             var text = $scope.currentItem.textSrc;
             var msg = new SpeechSynthesisUtterance( text );
             msg.lang = 'en-US';
             window.speechSynthesis.speak( msg );*/
        }
        $scope.speechSrcRobot = function (item) {

            var text = item.textSrc;
            var msg = new SpeechSynthesisUtterance(text);
            msg.lang = 'en-US';
            window.speechSynthesis.speak(msg);
        }
        $scope.$on( "playItem", function( event, item) {
            $scope.speechSrc( item );
        });
        function handlePlay(evt) {
            if ($scope.currentItem) {
                var p = (100 * ($scope.video.currentTime - $scope.currentItem.timeStart) / ($scope.currentItem.timeEnd - $scope.currentItem.timeStart));
                console.log(p);
                if ($scope.video.currentTime >= $scope.currentItem.timeEnd)
                {
                    $scope.video.pause();
                }
            }
        }
        $scope.download = function (filename, type) {
            var data = saveData();
            var file = new Blob([data], {type: type});
            if (window.navigator.msSaveOrOpenBlob) // IE10+
                window.navigator.msSaveOrOpenBlob(file, filename);
            else { // Others
                var a = document.createElement("a"),
                        url = URL.createObjectURL(file);
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function () {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 0);
            }
        }
        var saveData = function () {
            var resp = [];
            for (key in $scope.data) {
                s = $scope.data[key];
                var saveObj = {
                    textSrc: s.textSrc,
                    textTarget: s.textTarget,
                    timeStart: s.timeStart,
                    timeEnd: s.timeEnd
                };
                resp.push(saveObj);
            }
            return JSON.stringify(resp, null, 2);
        }

    }]);

