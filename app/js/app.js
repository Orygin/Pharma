'use strict';
angular.module('App', [  'ngRoute',  'App.filters',  'App.services',  'App.directives',  'App.controllers', 'ui.bootstrap' ]).

config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/listeCours', {templateUrl: 'tpl/listeCours.html', controller: 'listeCoursCtrl'});
	$routeProvider.when('/addCours', {templateUrl: 'tpl/editCours.html', controller: 'addCoursCtrl'});
	$routeProvider.when('/editCours/:id', {templateUrl: 'tpl/editCours.html', controller: 'editCoursCtrl'});
	$routeProvider.when('/listeQcm', {templateUrl: 'tpl/lqcm.html', controller: 'listeQcmCtrl'});
	$routeProvider.otherwise({templateUrl:"tpl/home.html", controller: "homeCtrl"});
}]);
