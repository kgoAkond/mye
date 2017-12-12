angular.module('MYE', []).controller('mainCtr', ['$scope', '$http', 'utils', function ($scope, $http, utils ) {
        
        $scope.talks = [];
        $scope.view = "menu";
        
        $scope.selectTalk = function( talk ) {
            $scope.talk = talk;
            $scope.view = "player";
        }
        this.$onInit = function () {
            var callback = function( json ) {
                 $scope.talks = json;                
                 $scope.isInitialized = true; 
             }
            utils.loadJson( "app/data/talks.json" , callback );
        }
        $scope.$on('backToMenu', function (event, args) {
               $scope.view = "menu";
        });

    }]);

