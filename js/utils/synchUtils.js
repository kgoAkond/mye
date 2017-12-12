angular.module('MYE').service('synchUtils', [function () {
        return {
            addTokens: function (arr, tokens, ind) {
                for (var i = 0; tokens && i < tokens.length; i++) {
                    try {
                        var tkn = tokens[ i ];
                        if (arr.hasOwnProperty(tkn)) {
                            arr[ tkn ].push(ind);
                        } else {
                            arr[ tkn ] = [ind];
                        }
                    } catch (e) {
                        console.log("");
                    }
                }
            },
            tokenize: function ( ) {
                var regN = /(?:\d*\.)?\d+/g;
                var regW = /[a-zA-Z']+/g;
                for (var i = 0; i < $scope.vttEN.length; i++) {
                    var txt = $scope.vttEN[i].text;
                    var arrNumbers = txt.match(regN);
                    var arrWords = txt.match(regW);
                    addTokens($scope.dicWordEN, arrWords, i);
                    addTokens($scope.dicNumberEN, arrNumbers, i);
                }
                for (var i = 0; i < $scope.vttPL.length; i++) {
                    var txt = $scope.vttPL[i].text;
                    var arrNumbers = txt.match(regN);
                    var arrWords = txt.match(regW);
                    addTokens($scope.dicWordPL, arrWords, i);
                    addTokens($scope.dicNumberPL, arrNumbers, i);
                }
            },
            printTokens: function (arr) {
                for (var key in arr) {
                    if (arr.hasOwnProperty(key)) {
                        console.log(key, arr[ key ].length);
                    }
                }
            }

        }
    }]);

