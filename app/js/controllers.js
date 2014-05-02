'use strict';

angular.module('App.controllers', [])
.controller('MainCtrl', ['$scope', '$location', '$http', function($scope, $location, $http){
	$scope.connected = true; // Assume we are connected. If we aren't, any query to the server will force disconnection
	$scope.alerts = [];
	$scope.addAlert = function(message, typ) {
		$scope.alerts.push({msg: message, type:typ});
	};
	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
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
			}
			else
				$scope.isError(data, status);
		});
	};
	$scope.setConnectionStatus = function(status) {
		if(status == false && $scope.connected)
			$location.path('/');
		$scope.connected = status;
	};
}])
.controller('homeCtrl', ['$scope', '$http', function($scope, $http) {
	$scope.userInfo = {};

	$http.get('api/home').success(function(data, status) {
		if(status == 200)
			$scope.setConnectionStatus(true);
		else if (status == 401)
			$scope.setConnectionStatus(false);
		else
			$scope.isError(data, status);
	});

	$scope.connect = function(name, password) {
		$http.post('api/connect', {name: name, password: password}).success(function(data, status) {
			if(status == 200){
				$scope.setConnectionStatus(true);
				$scope.userInfo = data;
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
}]);
