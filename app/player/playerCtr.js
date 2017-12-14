angular.module('MYE').controller('playerCtr', ['$scope', '$http', 'utils', 'SynchText', function ( $scope, $http, utils, SynchText ) {
        
        $scope.talk =  extendTalk( tedTalk );
        initAudio($scope.talk.movie);
        utils.loadJson( $scope.talk.textPL, loadVttPLCallback); 
           
        function loadVttPLCallback( vtt ) {
            $scope.vttPL = utils.parseVtt ( vtt );
            utils.loadJson( $scope.talk.textEN, loadVttENCallback);
        }
        function loadVttENCallback( vtt ) {
            $scope.vttEN = utils.parseVtt ( vtt );
            SynchText.marge( $scope.vttPL , $scope.vttEN  )
        }
        function initAudio(url) {
            var video = document.getElementById('vPlayer');
            var source = document.createElement('source');
            $scope.video = video;
            $scope.video.addEventListener('timeupdate', handlePlay, false);            
            source.setAttribute('src', url);
            video.appendChild(source);

        }
        function extendTalk( talk ){
              talk.movie = "https://download.ted.com/talks/" + talk.movieId + "-480p.mp4";
              talk.textPL = "https://hls.ted.com/talks/" + talk.id + "/subtitles/pl/full.vtt";
              talk.textEN  = "https://hls.ted.com/talks/" + talk.id + "/subtitles/en/full.vtt";
              return talk;
        }

        $scope.selectItem = function (ind, item) {
            item.isTextSrcVisible = true;
            $scope.selectedItem = item;
            if($scope.talk.voice === "robot") {
                $scope.robotPlay(item);                
            } else  {
                $scope.play(item);
            }   
            
        }
        function isVideoPlaing() {
            return $scope.video.currentTime > 0 && !$scope.video.paused && !$scope.video.ended && $scope.video.readyState > 2;
        }
        $scope.robotPlay = function( item ){
            utils.speechText(item.textSrc, 'en-US');
        }
        $scope.play = function (item) {
            if (isVideoPlaing()) {
                $scope.video.pause();
            }
            $scope.video.currentTime = item.timeStart;
            $scope.videoJustStarted = true;
            if (!isVideoPlaing()) {                
                $('#progressBar').css('background-color', 'rgba(255, 100, 0, 0.8)');
                $scope.video.play();
            }
        }
        $scope.back = function() {
            $scope.$emit("backToMenu");
        }
        function handlePlay(evt) {
            var p = ( 100 * ( $scope.video.currentTime  - $scope.selectedItem.timeStart ) / ( $scope.selectedItem.timeEnd - $scope.selectedItem.timeStart ));
            if( p < 100 ){   
                $("#progressBar").css("width", p + "%" );                    
            }
            if ($scope.video.currentTime >= $scope.selectedItem.timeEnd)
            {
                $("#progressBar").css("width", "100%" );
                //$('#progressBar').css('background-color', 'rgba(255, 100, 0, 0.0)');                
                $scope.video.pause();                
            }
        }

    }]);

