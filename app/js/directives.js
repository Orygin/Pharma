'use strict';

angular.module('App.directives', []).
directive('integer', function(){
    return {
        require: 'ngModel',
        link: function(scope, ele, attr, ctrl){
            ctrl.$parsers.unshift(function(viewValue){
                return parseInt(viewValue);
            });
        }
    };
})
.directive('autounfocus', function($window) {
	return function (scope, ele, attr) {
		ele.on('mouseleave', function() {
			ele[0].blur();
		});
	}
});