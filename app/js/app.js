'use strict';
angular.module('App', [  'ngRoute',  'App.filters',  'App.services',  'App.directives',  'App.controllers', 'ui.bootstrap' ]).

config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/listeCours', {templateUrl: 'tpl/lcours.html', controller: 'listeCoursCtrl'});
  $routeProvider.when('/listeQcm', {templateUrl: 'tpl/lqcm.html', controller: 'listeQcmCtrl'});
  $routeProvider.otherwise({templateUrl:"tpl/home.html", controller: "homeCtrl"});
}]);
