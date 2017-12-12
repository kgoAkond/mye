(function () {
    function controller( $scope ) {
        var ctrl = this;        
        this.$onChanges = function () { 
            var factor = 30;
            var item = this.items[this.index];
            ctrl.item = item;
            if(this.index == 0) {
                var h = Math.round( item.timeStart * factor);
                ctrl.zeroStyle = "{color:'black', height: '" + h + "px'}";
            }
            var h = Math.round( (item.timeEnd - item.timeStart) * factor);
            ctrl.textStyle = "{color:'black', height: '" + h + "px'}";
            ctrl.text = item.text + " " + item.timeStart + " --> " + item.timeEnd;
            var tstart = item.timeEnd;
            var tend = this.items[this.index + 1].timeStart;
            h = Math.round( (tend - tstart) * factor);
            ctrl.emptyStyle = "{color:'green', height: '" + h + "px'}";
            setTextTranslated();
        }    
        function setTextTranslated() {
            ctrl.textTranslated = "";
            for(var i = 0; i < ctrl.item.items.length; i++){
                ctrl.textTranslated += ctrl.item.items[i].text + " ";
            }
        }
        ctrl.play = function() {
            $scope.$emit( "playItem", ctrl.item );
        }
    }
    angular.module('MYE').component('editorItem', {
        templateUrl: 'js/editorItem/editorItem.html',
        controller: [ '$scope', controller ],       
        bindings: {
            items: '<',
            index: '<'
        }
    });
})();