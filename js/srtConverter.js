angular.module('MYE').service('srtConverter', ['$http', function ($http) {
        return {
            loadJson: function (filename, callback) {
                 $http.get(filename).then(function successCallback( response ) {
                    var json = response.data;
                    callback(json);
                }, function errorCallback(response) {
                    console.log("ERROR DURING LOAD FILES");
                });
            },        
            speechText: function ( text, lang ) {
                var msg = new SpeechSynthesisUtterance( text );
                msg.lang = lang;
                window.speechSynthesis.speak( msg );
            }
        }
    }]);

