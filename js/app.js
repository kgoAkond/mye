angular.module('MYE', ['ngMaterial', 'ngMessages', 'ngAnimate']).controller('mainCtr', ['$scope', '$http', function ($scope, $http) {

        
        var filenameTARGET = 'data/3206227.xml';
        var filenameSRC = 'data/5073271.xml';
        var filenameSYNCH = 'data/firendsS07e01.synch.xml';
        var mediaFilename = 'http://achimov.com/mye/Friends.mp4';
        var savedFilename = 'data/friends.json';
        /*
        var filenameTARGET = 'data/1/src.xml';
        var filenameSRC = 'data/1/target.xml';
        var filenameSYNCH = 'data/1/synch.xml';
        var mediaFilename = 'http://achimov.com/mye/Friends.mp4';
        */
        
        $scope.currentItem;        
        $scope.data = {
            correction: 1
        }
        $scope.initStatus = {
            src: false,
            target: false,
            synch: false
        };
        $scope.isInitialized = false;

        function loadXml(filename, callback) {
            $http.get(filename).then(function successCallback(response) {
                var clearTxt = response.data.replace(/(\r\n|\n|\r)/gm, "");
                var xml = $.parseXML(clearTxt);
                var json = xmlToJson(xml);
                var jsonText = JSON.stringify(json);
                // console.log(clearTxt);
                callback(json);
            }, function errorCallback(response) {
                console.log("ERROR DURING LOAD FILES");
            });
        }
        function joinTxt(arr) {
            var str = "";
            if (Array.isArray(arr)) {
                for (key in arr) {
                    str += " " + arr[key].trim();
                }
            } else {
                str = arr;
            }
            return str;
        }
        function convertToTime( time ){
           var s = time.split(":");
           var t = parseInt( s[0] ) * 3600 + parseInt( s[1] ) * 60 + parseFloat( s[2].replace(',','.') );  
           return t; 
        }
        function parseTime( t, s ) {
            var fun = function(t, time) {
                   var tag = time['@attributes'].id;
                   if(tag.match( /T\d*S/ )) {    
                        t.timeStart = convertToTime( time['@attributes'].value );
                    } else if(tag.match( /T\d*E/ )) {
                          t.timeEnd = convertToTime( time['@attributes'].value );
                    }  
            }    
            if(s.time) {
                if( !Array.isArray( s.time )) {    
                       fun( t, s.time);
                } else {
                    for( key in s.time ) {
                        fun( t, s.time[ key ]);    
                    }    
                }
            }    
        }
        function convertToMYE(json) {
            var resp = [];
            for (key in json.document.s) {
                try {
                    var t = {};
                    var s = json.document.s[ key ];
                    t.text = joinTxt(s['#text']);
                    t.id = s['@attributes'].id;
                    parseTime(t, s);
                    resp[t.id] = t;
                } catch (e) {
                    console.log(e);
                }
            }
            return resp
        }
        function convertToMYEsynch(json) {
            var resp = [];
            for (key in json.linkGrp.link) {
                try {
                    var t = {};
                    var link = json.linkGrp.link[ key ];
                    t.xtargets = link['@attributes'].xtargets;
                    resp.push(t);
                } catch (e) {
                    console.log(e);
                }
            }
            return resp
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
            var saved = true;
            if( saved ) {
                var callback = function( json ) {
                    $scope.data.synch = json;
                    videoTest();
                    $scope.isInitialized = true; 
                }
                loadJson( savedFilename, callback );
            } else {
                var myCallbackTARGET = function (json) {
                    $scope.data.target = convertToMYE(json);                
                    $scope.initStatus.target = true;
                    checkInitProgress();
                }
                var myCallbackSRC = function (json) {
                    $scope.data.src = convertToMYE(json);
                    $scope.initStatus.src = true;
                    checkInitProgress();
                }
                var myCallbackSYNCH = function (json) {
                    $scope.data.synch = convertToMYEsynch(json);
                    $scope.initStatus.synch = true;
                    checkInitProgress();
                }
                loadXml(filenameTARGET, myCallbackTARGET);
                loadXml(filenameSRC, myCallbackSRC);
                loadXml(filenameSYNCH, myCallbackSYNCH);
             }
        }
        $scope.speechSrc = function ( item ) {
            var msg = new SpeechSynthesisUtterance( item.textSrc );
            msg.lang = 'en-US';
            window.speechSynthesis.speak( msg );
        }
        $scope.speechTarget = function ( item ) {
            var msg = new SpeechSynthesisUtterance( item.textTarget );            
            window.speechSynthesis.speak( msg );
        }
        $scope.play = function (item) {           
            var video = document.getElementById('vPlayer');
            video.play();
            $scope.item = item;
            console.log(item);
        }
        $scope.pause = function (item) {
           var video = document.getElementById('vPlayer');
           video.pause();
        }
        $scope.move = function (item) {
 
            $scope.video.currentTime = item.timeStart;
            $scope.currentItem = item;
            $scope.video.play();
            $scope.item = item;
            console.log(item);
        }
        function handlePlay(evt) {
            //console.log($scope.video.currentTime);
            if( $scope.currentItem ) {
                    if ($scope.video.currentTime >= $scope.currentItem.timeEnd )
                    {
                        $scope.video.pause();
                    }
            }
        }
        function handlePlayAudio(evt) {
            console.log($scope.audio.currentTime);

        }
        $scope.save = function() { 
            var resp = [];
             for( key in $scope.data.synch ) {
                 s = $scope.data.synch[key];
                 var saveObj = {
                     textSrc: s.textSrc,
                     textTarget: s.textTarget,
                     timeStart: s.timeStart,
                     timeEnd: s.timeEnd
                 };    
                 resp.push( saveObj );
            }
             console.log( JSON.stringify( resp , null, 2) );
        }
        function round2( num ){
                return Math.round(num * 100) / 100
        }
        $scope.recalculateTime = function () {
            for( key in $scope.data.synch ) {
                 s = $scope.data.synch[key];
                 if( !s.timeStartOrg ) {
                        s.timeStartOrg =  s.timeStart;
                 }
                 if( !s.timeEndOrg ) {
                        s.timeEndOrg =  s.timeEnd;
                 }
                 s.timeStart = round2( s.timeStartOrg * $scope.data.correction );    
                 s.timeEnd = round2( s.timeEndOrg * $scope.data.correction );    
            }
        }
        function makeLink(synch) {
            var xtargets = synch.xtargets;
            var x = xtargets.split(';');
            var src = [].concat(x[0].split(' '));
            var target = [].concat(x[1].split(' '));
            synch.textTarget = "";
            synch.textSrc = "";
            for (key in src) {
                try {
                    var s = $scope.data.src[ src[ key ] ];
                    if (s) {
                        synch.src.push(s);
                        synch.textSrc += s.text + "\n"
                        if(s.timeStart) {
                            synch.timeStart = s.timeStart; 
                            synch.timeStartOrg = s.timeStart; 
                        }
                        if( s.timeEnd ) {
                             synch.timeEnd = s.timeEnd;
                             synch.timeEndOrg = s.timeEnd
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            }
            for (key in target) {
                try {
                    var s = $scope.data.target[ target[ key ] ];
                    if (s) {
                        synch.target.push(s);
                        synch.textTarget += s.text + "\n"
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }
        function makeLinks( ) {
            for (key in $scope.data.synch) {
                var synch = $scope.data.synch[ key ];
                synch.src = [];
                synch.target = [];
                makeLink(synch);
            }
        }
        function videoTest() {
            var video = document.getElementById('vPlayer');
            var source = document.createElement('source');  
            $scope.video = video;
            
            $scope.video.addEventListener('timeupdate', handlePlay, false);; 
            //source.setAttribute('src', 'https://video-http.media-imdb.com/MV5BYjM1OGI0NDAtNzU5Mi00OTY5LThkMjgtNTE3ZDE3NDM1YzRjXkExMV5BbXA0XkFpbWRiLWV0cy10cmFuc2NvZGU@.mp4?Expires=1507988704&Signature=1zkp8OfCq0yZEz1GCZIY77kS8B1mR3R~4SSnl5Q8BZF1kIPruus90ub3ZzVd7L~rqT~W11d5xWbe4Np63V0xoCnO-jXtMsZkhjqvCtIjvmGDWn8BvyKQLvVxfH9kpjIM3bCKzYcfRE62EfvmT-c1dY8KrKIr14s-yl7NqCr3KIg_&Key-Pair-Id=APKAILW5I44IHKUN2DYA');
           // source.setAttribute('src', 'https://ph2dpm.oloadcdn.net/dl/l/a35hhMrxboIV3u8W/Go3F4GHG_Kw/Friends.S07E01.BluRay.mp4');
            source.setAttribute('src', mediaFilename);
            $scope.source = source;
            video.appendChild(source);
            

            
        }
        function checkInitProgress(  ) {

            var isDone = $scope.initStatus.target && $scope.initStatus.src && $scope.initStatus.synch;
            if (isDone) {
                makeLinks( );
                console.log(document.getElementById('vPlayer'));
                videoTest();
                $scope.isInitialized = true;
            }
            console.log(isDone);
        }

    }]);

