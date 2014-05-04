'use strict';
angular.module('App', [  'ngRoute',  'App.filters',  'App.services',  'App.directives',  'App.controllers', 'ui.bootstrap' ]).

config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/listeCours', {templateUrl: 'tpl/listeCours.html', controller: 'listeCoursCtrl'});
	$routeProvider.when('/addCour', {templateUrl: 'tpl/editCour.html', controller: 'addCourCtrl'});
	$routeProvider.when('/editCour/:id', {templateUrl: 'tpl/editCour.html', controller: 'editCourCtrl'});
	$routeProvider.when('/listeChapitres/:id', {templateUrl: 'tpl/listeChapitres.html', controller: 'listeChapitresCtrl'});
	$routeProvider.when('/addChapitre/:id', {templateUrl: 'tpl/editChapitre.html', controller: 'addChapitreCtrl'});
	$routeProvider.when('/editChapitre/:id', {templateUrl: 'tpl/editChapitre.html', controller: 'editChapitreCtrl'});
	$routeProvider.when('/viewChapitre/:id', {templateUrl: 'tpl/viewChapitre.html', controller: 'viewChapitreCtrl'});
	$routeProvider.when('/listeQcm', {templateUrl: 'tpl/lqcm.html', controller: 'listeQcmCtrl'});
	$routeProvider.otherwise({templateUrl:"tpl/home.html", controller: "homeCtrl"});
}]);
