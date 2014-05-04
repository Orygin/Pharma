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
		$http.get('api/removeCours/' + id)
			.success(function() {
				for (var i = $scope.cours.length - 1; i >= 0; i--) {
					if($scope.cours[i]._id == id){
						$scope.cours.splice(i, 1);
					}
				};
			}).error($scope.isError);
	};
}])
.controller('addCoursCtrl', ['$scope', '$location', '$http', function($scope, $location, $http){
	$scope.send = function(cour) {
		$http.post('api/addCours', JSON.stringify(cour)).success(function() {
			$location.path('/listeCours');
		}).error($scope.isError);
	};
}])
.controller('editCoursCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams){
	$http.get('api/getCours/' + $routeParams.id).success(function(data) {
		$scope.cour = data;
	}).error($scope.isError);
	$scope.send = function(cour) {
		$http.post('api/editCours/' + cour._id, cour).success(function() {
			$location.path('/listeCours');
		}).error($scope.isError);
	};
}]);