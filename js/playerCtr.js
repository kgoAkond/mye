angular.module('MYE', []).controller('playerCtr', ['$scope', '$http', '$location', function ($scope, $http, $location ) {
       
        /*
        var mediaFilename = 'http://achimov.com/mye/Friends.mp4';
        var savedFilename = 'data/friends.json';
        */
        
        var mediaFilename = 'http://achimov.com/mye/data/ted/AugiePicado_2017S-320k.mp4';
        var savedFilename = 'data/ted/AugiePicado_2017S.json';
        $scope.revmode = false;
        
        $scope.currentItem;        
        $scope.isInitialized = false;
        $scope.currentIndex = 0;
        $scope.state = {
            isEnglishVisible: true,
            isPolishVisible: true,
            isTextInputVisible: false
        }
        
        function loadJson(filename, callback) {
             $http.get(filename).then(function successCallback( response ) {
                var json = response.data;
                callback(json);
            }, function errorCallback(response) {
                console.log("ERROR DURING LOAD FILES");
            });
        }
        this.$onInit = function () {
            $scope.revmode = $location.$$absUrl.indexOf("revmode") > 0 ;
            var callback = function( json ) {
                 $scope.data = json;
                 $scope.currentIndex = 0;
                 $scope.currentItem = $scope.data[ $scope.currentIndex ];
                 videoTest();
                 $scope.isInitialized = true; 
             }
            loadJson( savedFilename, callback );
        }
        $scope.btnClicked = function() {
            console.log( "btn clicked" );
        }
        
        $scope.speechSrc = function ( ) {
            $scope.move( $scope.data[ $scope.currentIndex ] );            
            /*
            var text = $scope.currentItem.textSrc;
            var msg = new SpeechSynthesisUtterance( text );
            msg.lang = 'en-US';
            window.speechSynthesis.speak( msg );*/
        }
        $scope.speechTarget = function ( ) {
            var text = $scope.currentItem.textTarget;
            var msg = new SpeechSynthesisUtterance( text );            
            window.speechSynthesis.speak( msg );
        }
        $scope.playNext = function() {
            if($scope.revmode){
                $scope.playNextMode2()
            } else {
                $scope.playNextMode1()
            }                              
        }
        $scope.playNextMode1 = function() {
             if( $scope.state.isEnglishVisible ) {
                $scope.video.pause();
                $scope.state.isEnglishVisible = false;
                $scope.currentIndex++;
                $scope.currentItem = $scope.data[ $scope.currentIndex ];
                //$scope.speechTarget();          
            } else {
                $scope.state.isEnglishVisible = true;
                $scope.speechSrc();  
            }    
        }
        $scope.playNextMode2 = function() {
            if( $scope.state.isPolishVisible ) {
                $scope.video.pause();
                $scope.state.isEnglishVisible = false;
                $scope.state.isPolishVisible = false;
                $scope.currentIndex++;
                $scope.currentItem = $scope.data[ $scope.currentIndex ];
                $scope.speechSrc(); 
            } else if( $scope.state.isEnglishVisible ) {
                $scope.state.isPolishVisible = true;
            } else {
                $scope.state.isEnglishVisible = true;
            }                       
        }
        $scope.pause = function (item) {
           var video = document.getElementById('vPlayer');
           video.pause();
        }
        $scope.move = function (item) {
            $scope.video.pause();
            $scope.video.currentTime = item.timeStart;
            $scope.currentItem = item;
            $scope.video.play();
            $scope.item = item;
        }
        function handlePlay(evt) {
            if( $scope.currentItem ) {
                    var p = (100 * ($scope.video.currentTime  - $scope.currentItem.timeStart )/ ( $scope.currentItem.timeEnd - $scope.currentItem.timeStart ));
                    console.log( p );
                    $("#progressTarget").css("width", p + "%" );
                    if ($scope.video.currentTime >= $scope.currentItem.timeEnd )
                    {
                        $("#progressTarget").css("width", "0%" );
                        $scope.video.pause();
                    }
            }
        }
        function handlePlayAudio(evt) {
            console.log($scope.audio.currentTime);

        }
        function videoTest() {
            var video = document.getElementById('vPlayer');
            var source = document.createElement('source');  
            $scope.video = video;
            
            $scope.video.addEventListener('timeupdate', handlePlay, false);; 
            source.setAttribute('src', mediaFilename);
            $scope.source = source;
            video.appendChild(source);
                     
        }        
    }]);

