'use strict';

angular.module('App.controllers', [])
.controller('MainCtrl', ['$scope', '$location', '$http', function($scope, $location, $http){
	$scope.alerts = [];
	$scope.addAlert = function(message, typ) {
		$scope.alerts.push({msg: message, type:typ});
	};
	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.setConnectionStatus = function(status) {
		if(status == false)
			$location.path('/');
		$scope.connected = status;
	};
	$scope.setUserInfo = function(data) {
		$scope.userInfo = data;
	};
	$scope.isError = function(data, status) {
		if(data.error){
			switch(data.error){
				case 'not logged':
					$scope.addAlert('Vous n\'êtes pas connecté, veuillez vous logger', 'warning');
					$scope.setConnectionStatus(false);
					return true;
					break;
				default:
					$scope.addAlert('Une erreur indéterminée s\'est produite, veuillez réessayer', 'info');
					return true;
					break;
			}
		}
		else if(status != 200){
			switch(status){
				case 401:
					$scope.addAlert('Vous n\'êtes pas connecté, veuillez vous logger', 'warning');
					$scope.setConnectionStatus(false);
					return true;
					break;
				case 500:
				default:
					console.dir(data);
					return true;
					break;
			}
		}
		else
			return false;
	};
	$scope.disconnect = function() {
		$http.get('api/destroySession').error(function(data, status) {
			if(status == 401){
				$scope.addAlert('Vous venez d\'etre déconnecté', 'info');
				$scope.setConnectionStatus(false);
				$scope.setUserInfo({});
			}
			else
				$scope.isError(data, status);
		});
	};

	$scope.connected = true; // Assume we are connected. If we aren't, any query to the server will force disconnection
	$scope.userInfo = {};

	$http.get('api/home').success(function(data, status) {
		$scope.userInfo = data;
		$scope.setConnectionStatus(true);
	}).error($scope.isError);
}])
.controller('homeCtrl', ['$scope', '$http', function($scope, $http) {
	$scope.connect = function(name, password) {
		$http.post('api/connect', {name: name, password: password}).success(function(data, status) {
			if(status == 200){
				$scope.setConnectionStatus(true);
				$scope.setUserInfo(data);
			}
			else
				$scope.isError(data, status);
		}).error(function(data, status) {
			if (status == 401){
				$scope.addAlert('Nom d\'utilisateur ou mot de passe incorrect !', 'danger');
			}
			else
				$scope.isError(data, status);
		});
	};
}])
.controller('listeCoursCtrl', ['$scope', '$http', function($scope, $http){
	$http.get('api/listeCours').success(function(data) {
		$scope.cours = data;
	}).error($scope.isError);
	$scope.remove = function(id) {
		$http.get('api/removeCour/' + id)
			.success(function() {
				for (var i = $scope.cours.length - 1; i >= 0; i--) {
					if($scope.cours[i]._id == id){
						$scope.cours.splice(i, 1);
					}
				};
			}).error($scope.isError);
	};
}])
.controller('addCourCtrl', ['$scope', '$location', '$http', function($scope, $location, $http){
	$scope.send = function(cour) {
		$http.post('api/addCour', cour).success(function() {
			$location.path('/listeCours');
		}).error($scope.isError);
	};
}])
.controller('editCourCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams){
	$http.get('api/getCour/' + $routeParams.id).success(function(data) {
		$scope.cour = data;
	}).error($scope.isError);
	$scope.send = function(cour) {
		$http.post('api/editCour/' + cour._id, cour).success(function() {
			$location.path('/listeCours');
		}).error($scope.isError);
	};
}])
.controller('listeChapitresCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){
	$scope.coursId = $routeParams.id;
	$http.get('api/listeChapitres/' + $scope.coursId).success(function(data) {
		$scope.chapitres = data;
	}).error($scope.isError);
	$http.get('api/getCour/' + $routeParams.id).success(function(data) {
		$scope.cour = data;
	}).error($scope.isError);
	$scope.remove = function(id) {
		$http.get('api/removeChapitre/' + id)
			.success(function() {
				for (var i = $scope.chapitres.length - 1; i >= 0; i--) {
					if($scope.chapitres[i]._id == id){
						$scope.chapitres.splice(i, 1);
					}
				};
			}).error($scope.isError);
	};
}])
.controller('addChapitreCtrl', ['$scope', '$location', '$http', '$routeParams', function($scope, $location, $http, $routeParams){
	$scope.chapitre = {};
	$scope.chapitre.coursId = $routeParams.id;
	$scope.send = function(chapitre) {
		$http.post('api/addChapitre/' + $routeParams.id, chapitre).success(function() {
			$location.path('/listeChapitres/' + chapitre.coursId);
		}).error($scope.isError);
	};
}])
.controller('editChapitreCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams){
	$http.get('api/getChapitre/' + $routeParams.id).success(function(data) {
		$scope.chapitre = data;
	}).error($scope.isError);
	$scope.send = function(chapitre) {
		$http.post('api/editChapitre/' + chapitre._id, chapitre).success(function() {
			$location.path('/listeChapitres/' + chapitre.coursId);
		}).error($scope.isError);
	};
}])
.controller('viewChapitreCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams){
	$http.get('api/getChapitre/' + $routeParams.id).success(function(data) {
		$scope.chapitre = data;

		$http.get('api/getCour/' + data.coursId).success(function(data) {
			$scope.cour = data;
		}).error($scope.isError);
	}).error($scope.isError);
}]);