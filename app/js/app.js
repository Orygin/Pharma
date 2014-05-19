'use strict';
angular.module('App', [  'ngRoute', 'ngAnimate',  'App.filters',  'App.services',  'App.directives',  'App.controllers', 'ui.bootstrap', 'btford.markdown' ]).

config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/listeCours', {templateUrl: 'tpl/listeCours.html', controller: 'listeCoursCtrl'});
	$routeProvider.when('/addCour', {templateUrl: 'tpl/editCour.html', controller: 'addCourCtrl'});
	$routeProvider.when('/editCour/:id', {templateUrl: 'tpl/editCour.html', controller: 'editCourCtrl'});
	$routeProvider.when('/listeChapitres/:id', {templateUrl: 'tpl/listeChapitres.html', controller: 'listeChapitresCtrl'});
	$routeProvider.when('/addChapitre/:id', {templateUrl: 'tpl/editChapitre.html', controller: 'addChapitreCtrl'});
	$routeProvider.when('/editChapitre/:id', {templateUrl: 'tpl/editChapitre.html', controller: 'editChapitreCtrl'});
	$routeProvider.when('/viewChapitre/:id', {templateUrl: 'tpl/viewChapitre.html', controller: 'viewChapitreCtrl'});
	$routeProvider.when('/listeUsers', {templateUrl: 'tpl/listeUsers.html', controller: 'listeUsersCtrl'});
	$routeProvider.when('/addUser', {templateUrl: 'tpl/editUser.html', controller: 'addUserCtrl'});
	$routeProvider.when('/editUser/:id', {templateUrl: 'tpl/editUser.html', controller: 'editUserCtrl'});
	$routeProvider.when('/addQcm/:id', {templateUrl: 'tpl/editQcm.html', controller: 'addQcmCtrl'});
	$routeProvider.when('/editQcm/:id', {templateUrl: 'tpl/editQcm.html', controller: 'editQcmCtrl'});
	$routeProvider.when('/viewQcm/:id', {templateUrl: 'tpl/viewQcm.html', controller: 'viewQcmCtrl'});
	$routeProvider.when('/viewQcmResult/:id', {templateUrl: 'tpl/qcmResults.html', controller: 'viewQcmResultCtrl'});
	$routeProvider.otherwise({templateUrl:"tpl/home.html", controller: "homeCtrl"});
}]);
