'use strict';

angular.module('App.controllers', [])
.controller('MainCtrl', ['$scope', function($scope){
	$scope.alerts = [];
	$scope.addAlert = function(message, typ) {
		console.log('alert');
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
}])
.controller('homeCtrl', ['$scope', '$http', function($scope, $http) {
	$scope.userInfo = {};
	$scope.connected = false;

	$http.get('api/home').success(function(data, status) {
		if(status == 200)
			$scope.connected = true;
		else if (status == 401)
			$scope.connected = false;
		else
			$scope.checkError(data, status);
	});

	$scope.connect = function(name, password) {
		$http.post('api/connect', {name: name, password: password}).success(function(data, status) {
			if(status == 200){
				$scope.connected = true;
				$scope.userInfo = data;
			}
			else
				$scope.checkError(data, status);
		}).error(function(data, status) {
			if (status == 401){
				$scope.addAlert('Nom d\'utilisateur ou mot de passe incorrect !', 'danger');
			}
			else
				$scope.checkError(data, status);
		});
	};
}]);
