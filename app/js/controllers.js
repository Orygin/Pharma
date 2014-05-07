'use strict';

angular.module('App.controllers', [])
.controller('MainCtrl', ['$scope', '$location', '$http', '$rootScope', '$window', function($scope, $location, $http, $rootScope, $window){
	$scope.alerts = [];
	$scope.addAlert = function(message, typ) {
		$scope.alerts.push({msg: message, type:typ});
	};
	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.subBtn = [];
	$scope.addSubButton = function(btn) {
		if(btn.click === undefined && btn.link !== undefined)
			btn.click = function() {$location.path(btn.link)};

		$scope.subBtn[$scope.subBtn.length] = btn;
	};

	$rootScope.$on('$viewContentLoaded', function() {
		$scope.subBtn = [];
	});
	$scope.goto = function(path) {
		if(path === "auto")
			$window.history.back();
		else
			$location.path(path);
	};

	$scope.pageInfo = {name: "Accueil", back: ""};
	$scope.setPageInfo = function(data) {
		$scope.pageInfo = data;
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
	$scope.setPageInfo({name: 'Accueil', back:""});
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
	$scope.setPageInfo({name: 'Liste des cours', back:"/home"});
	
	$http.get('api/listeCours').success(function(data) {
		$scope.cours = data;

		$scope.addSubButton({
			show: $scope.userInfo.rank >= 3,
			dropdown: false,
			icon: "glyphicon glyphicon-plus",
			link: "/addCour"
		});
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
	$scope.moveUp = function(cour) {
		cour.position -= 1;
		$http.post('api/changeCourPosition/' + cour._id, {value: cour.position}).error(function(data, status) {
			cour.position += 1;
			return $scope.isError(data, status);
		});
	};
	$scope.moveDown = function(cour){
		cour.position += 1;
		$http.post('api/changeCourPosition/' + cour._id, {value: cour.position}).error(function(data, status) {
			cour.position -= 1;
			return $scope.isError(data, status);
		});
	};
	$scope.canMoveUp = function(cour) {
		if(cour.position == 0)
			return false;
		
		return true;
	};
}])
.controller('addCourCtrl', ['$scope', '$location', '$http', function($scope, $location, $http){
	$scope.setPageInfo({name: 'Ajouter un cours', back:"/listeCours"});
	$scope.cour = {};
	$scope.cour.rank = 0;
	$scope.send = function(cour) {
		$http.post('api/addCour', cour).success(function() {
			$location.path('/listeCours');
		}).error($scope.isError);
	};
}])
.controller('editCourCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams){
	$scope.setPageInfo({name: 'Modifier un cours', back:"/listeCours"});
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
	$scope.setPageInfo({name: 'Liste des chapitres', back:"/listeCours"});
	$scope.coursId = $routeParams.id;

	$http.get('api/listeChapitres/' + $scope.coursId).success(function(data) {
		$scope.chapitres = data;
		$scope.addSubButton({
			show: $scope.userInfo.rank >= 3,
			dropdown: false,
			icon: "glyphicon glyphicon-plus",
			link: "/addChapitre/" + $scope.coursId
		});
	}).error($scope.isError);
	$http.get('api/getCour/' + $routeParams.id).success(function(data) {
		$scope.cour = data;
		$scope.setPageInfo({name: data.name, back:"/listeCours"});
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
	$scope.moveUp = function(chapitre) {
		chapitre.position -= 1;
		$http.post('api/changeChapitrePosition/' + chapitre._id, {value: chapitre.position}).error(function(data, status) {
			chapitre.position += 1;
			return $scope.isError(data, status);
		});
	};
	$scope.moveDown = function(chapitre){
		chapitre.position += 1;
		$http.post('api/changeChapitrePosition/' + chapitre._id, {value: chapitre.position}).error(function(data, status) {
			chapitre.position -= 1;
			return $scope.isError(data, status);
		});
	};
	$scope.canMoveUp = function(chapitre) {
		if(chapitre.position == 0)
			return false;
		
		return true;
	};
}])
.controller('addChapitreCtrl', ['$scope', '$location', '$http', '$routeParams', function($scope, $location, $http, $routeParams){
	$scope.setPageInfo({name: 'Ajouter un chapitre', back:"/listeChapitres/" + $routeParams.id});
	$scope.chapitre = {};
	$scope.chapitre.coursId = $routeParams.id;
	$scope.send = function(chapitre) {
		$http.post('api/addChapitre/' + $routeParams.id, chapitre).success(function() {
			$location.path('/listeChapitres/' + chapitre.coursId);
		}).error($scope.isError);
	};
}])
.controller('editChapitreCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams){
	$scope.setPageInfo({name: 'Editer un chapitre', back:"/listeCours/"});
	$http.get('api/getChapitre/' + $routeParams.id).success(function(data) {
		$scope.setPageInfo({name: 'Editer un chapitre', back:"/listeChapitres/" + data.coursId});
		$scope.chapitre = data;
	}).error($scope.isError);
	$scope.send = function(chapitre) {
		$http.post('api/editChapitre/' + chapitre._id, chapitre).success(function() {
			$location.path('/listeChapitres/' + chapitre.coursId);
		}).error($scope.isError);
	};
}])
.controller('viewChapitreCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams){
	$scope.setPageInfo({name: 'Visioner un chapitre', back:"/listeChapitres"});
	$http.get('api/getChapitre/' + $routeParams.id).success(function(data) {
		$scope.chapitre = data;
		$scope.setPageInfo({name: data.name, back:"/listeChapitres/" + data.coursId});

		$http.get('api/getCour/' + data.coursId).success(function(data) {
			$scope.cour = data;
		}).error($scope.isError);
	}).error($scope.isError);
}])
.controller('listeUsersCtrl', ['$scope', '$http', function($scope, $http){
	$scope.setPageInfo({name: 'Liste des utilisateurs', back:"/home"});
	$http.get('api/getUsers/').success(function(data) {
		$scope.users = data;
		$scope.addSubButton({
			show: $scope.userInfo.rank >= 3,
			dropdown: false,
			icon: "glyphicon glyphicon-plus",
			link: "/addUser/"
		});
	}).error($scope.isError);
	$scope.remove = function(id) {
		$http.get('api/removeUser/' + id).success(function() {
			for (var i = $scope.users.length - 1; i >= 0; i--) {
					if($scope.users[i]._id == id){
						$scope.users.splice(i, 1);
					}
				};
		}).error($scope.isError);
	};
}])
.controller('addUserCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams){
	$scope.setPageInfo({name: 'Ajouter un utilisateur', back:"/listeUsers"});
	$scope.send = function(user) {
		$http.post('api/addUser', user).success(function() {
			$location.path('/listeUsers');
		}).error($scope.isError)
	};
}])
.controller('editUserCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams){
	$scope.setPageInfo({name: 'Editer un utilisateur', back:"/listeUsers"});
	$http.get('api/getUser/' + $routeParams.id).success(function(data) {
		$scope.user = data;
	}).error($scope.isError);
	$scope.send = function(user) {
		$http.post('api/addUser', user).success(function() {
			$location.path('/listeUsers');
		}).error($scope.isError)
	};
}]);