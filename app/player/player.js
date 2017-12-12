(function () {
    function controller($scope, utils, SynchText) {
        var ctrl = this;

        function loadVttPLCallback( vtt ) {
            ctrl.vttPL = utils.parseVtt ( vtt );
            utils.loadJson( ctrl.talk.textEN, loadVttENCallback);
        }
        function loadVttENCallback( vtt ) {
            ctrl.vttEN = utils.parseVtt ( vtt );
            SynchText.marge( ctrl.vttPL , ctrl.vttEN  )
        }
        function initAudio(url) {
            var video = document.getElementById('vPlayer');
            var source = document.createElement('source');
            ctrl.video = video;
            ctrl.video.addEventListener('timeupdate', handlePlay, false);            
            source.setAttribute('src', url);
            video.appendChild(source);

        }
        this.$onChanges = function () {
           ctrl.talk =  this.talk;
           initAudio(this.talk.movie);
           utils.loadJson( this.talk.textPL, loadVttPLCallback);
           
           
        }
        this.selectItem = function (ind, item) {
            item.isTextSrcVisible = true;
            ctrl.selectedItem = item;
            if(this.talk.voice === "robot") {
                ctrl.robotPlay(item);                
            } else  {
                ctrl.play(item);
            }   
            
        }
        function isVideoPlaing() {
            return ctrl.video.currentTime > 0 && !ctrl.video.paused && !ctrl.video.ended && ctrl.video.readyState > 2;
        }
        this.robotPlay = function( item ){
            utils.speechText(item.textSrc, 'en-US');
        }
        this.play = function (item) {
            if (isVideoPlaing()) {
                ctrl.video.pause();
            }
            ctrl.video.currentTime = item.timeStart;
            ctrl.videoJustStarted = true;
            if (!isVideoPlaing()) {                
                $('#progressBar').css('background-color', 'rgba(255, 100, 0, 0.8)');
                ctrl.video.play();
            }
        }
        this.back = function() {
            $scope.$emit("backToMenu");
        }
        function handlePlay(evt) {
            var p = ( 100 * ( ctrl.video.currentTime  - ctrl.selectedItem.timeStart ) / ( ctrl.selectedItem.timeEnd - ctrl.selectedItem.timeStart ));
            if( p < 100 ){   
                $("#progressBar").css("width", p + "%" );                    
            }
            if (ctrl.video.currentTime >= ctrl.selectedItem.timeEnd)
            {
                $("#progressBar").css("width", "100%" );
                //$('#progressBar').css('background-color', 'rgba(255, 100, 0, 0.0)');                
                ctrl.video.pause();                
            }
        }
    }
    angular.module('MYE').component('myePlayer', {
        templateUrl: 'app/player/player.html',
        controller: ['$scope', 'utils', 'SynchText', controller],       
        bindings: {
            talk: '<',
        }
    });
})();