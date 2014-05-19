'use strict';
// Compute the edit distance between the two given strings
function getEditDistance(a, b) {
  if(a.length === 0) return b.length; 
  if(b.length === 0) return a.length; 
 
  var matrix = [];
 
  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }
 
  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }
 
  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b.charAt(i-1) == a.charAt(j-1)){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }
 
  return matrix[b.length][a.length];
};

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
		if(typeof(path) == "function"){
			if(!path())
				$scope.goto($scope.pageInfo.fallback);
		}
		else if(path === "auto")
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
		console.log(status, data);
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
					$scope.addAlert('Une erreur indéterminée s\'est produite, veuillez réessayer', 'info');
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
	// -> Fisher–Yates shuffle algorithm
	$scope.shuffleArray = function(array) {
	  var m = array.length, t, i;

	  // While there remain elements to shuffle
	  while (m) {
	    // Pick a remaining element…
	    i = Math.floor(Math.random() * m--);

	    // And swap it with the current element.
	    t = array[m];
	    array[m] = array[i];
	    array[i] = t;
	  }

	  return array;
	}

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
	$scope.rankShown = {r0:true,r1:true,r2:true};
	$scope.filterOn = false;
	$scope.toggleFilter = function() {
		$scope.filterOn = !$scope.filterOn;
	};
	$scope.shouldShow = function(rank) {
		if(rank == 0)
			return $scope.rankShown.r0;
		else if (rank == 1)
			return $scope.rankShown.r1;
		else if (rank == 2)
			return $scope.rankShown.r2;
	};
	$http.get('api/listeCours').success(function(data) {
		$scope.cours = data;

		$scope.addSubButton({
			show: $scope.userInfo.rank >= 3,
			dropdown: false,
			icon: "glyphicon glyphicon-plus",
			link: "/addCour"
		});
		$scope.addSubButton({
			show: true,
			dropdown: false,
			icon: "glyphicon glyphicon-filter",
			click: $scope.toggleFilter
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
	$scope.removeQcm = function(qcm, chapitre) {
		$http.get('api/removeQcm/' + chapitre._id + '/' + qcm._id)
			.success(function() {
				for (var i = $scope.chapitres.length - 1; i >= 0; i--) {
					if($scope.chapitres[i] === chapitre){
						for (var j = $scope.chapitres[i].qcm.length - 1; j >= 0; j--) {
							if($scope.chapitres[i].qcm[j] === qcm)
								$scope.chapitres[i].qcm.splice(j, 1);
						};
					}
				};
			}).error($scope.isError);
	};
	$scope.moveUp = function(chapitre, qcm) {
		chapitre.position -= 1;
		if(!qcm)
			$http.post('api/changeChapitrePosition/' + chapitre._id, {value: chapitre.position}).error(function(data, status) {
				chapitre.position += 1;
				return $scope.isError(data, status);
			});
		else
			$http.post('api/changeQcmPosition/' + chapitre._id, {value: chapitre.position}).error(function(data, status) {
				chapitre.position += 1;
				return $scope.isError(data, status);
			});
	};
	$scope.moveDown = function(chapitre, qcm){
		chapitre.position += 1;
		if(!qcm)
			$http.post('api/changeChapitrePosition/' + chapitre._id, {value: chapitre.position}).error(function(data, status) {
				chapitre.position -= 1;
				return $scope.isError(data, status);
			});
		else
			$http.post('api/changeQcmPosition/' + chapitre._id, {value: chapitre.position}).error(function(data, status) {
				chapitre.position -= 1;
				return $scope.isError(data, status);
			});
	};
	$scope.canMoveUp = function(chapitre) {
		if(chapitre.position == 0)
			return false;
		
		return true;
	};
	$scope.toggleQcmList = function(cour) {
		if(cour.active === undefined)
			cour.active = true;
		else
			cour.active = !cour.active;
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
}])
.controller('listeQcmCtrl', ['$scope', '$http', '$location', function($scope, $http, $location){
	$scope.getChapitreId = function() {
		return $scope.chapitre._id;
	};
}])
.controller('addQcmCtrl', ['$scope', '$http', '$window', '$routeParams', function($scope, $http, $window, $routeParams){
	$scope.setPageInfo({name: 'Ajouter un questionnaire', back: 'auto'});
	$scope.chapitreId = $routeParams.id;
	$scope.qcm = {};
	$scope.send = function(qcm) {
		qcm = angular.copy(qcm);
		$http.post('api/addQcm/' + $scope.chapitreId, qcm).success(function() {
			$window.history.back();
		}).error($scope.isError)
	};
}])
.controller('editQcmCtrl', ['$scope', '$http', '$window', '$routeParams', function($scope, $http, $window, $routeParams){
	$scope.setPageInfo({name: 'Editer un questionnaire', back:"/home"});

	$http.get('api/getQcm/' + $routeParams.id).success(function(data) {
		$scope.setPageInfo({name: 'Ajouter un questionnaire', back:"/listeChapitres/" + data.coursId});
		console.dir(data);
		$scope.chapitreId = data._id;
		$scope.qcm = data.qcm[0];
	}).error($scope.isError)

	$scope.send = function(qcm) {
		qcm = angular.copy(qcm); //wipes out unused keys
		$http.post('api/editQcm/' + qcm._id, qcm).success(function() {
			$window.history.back();
		}).error($scope.isError)	
	};
}])
.controller('qcmFormCtrl', ['$scope', function($scope){
	$scope.addQuestion = function() {
		if($scope.qcm.questions === undefined)
			$scope.qcm.questions = [];
		$scope.qcm.questions[$scope.qcm.questions.length] = {name: "sauce"};
	};
	$scope.addAnswer = function(question) {
		if(question.answers === undefined)
			question.answers = [];
		question.answers[question.answers.length] = {value: "1"};
	};
	$scope.removeAnswer = function(question, id) {
		question.answers.splice(id, 1);
	};
}])
.controller('viewQcmCtrl', ['$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, $location){
	$scope.previous = function() {
		if($scope.position == 0 || $scope.showingResults)
			return false;

		$scope.position -= 1;
		$scope.question = $scope.qcm.questions[$scope.position];
		return true;
	};

	$scope.setPageInfo({name: 'Questionnaire', back:"/home/"});
	$scope.question = {};
	$scope.position = 0;

	$http.get('api/getQcm/' + $routeParams.id).success(function(data) {
		$scope.chapitreId = data._id;
		$scope.qcm = data.qcm[0];
		$scope.question = $scope.qcm.questions[0];

		$scope.setPageInfo({name: $scope.qcm.name, back: $scope.previous, fallback:"/listeChapitres/" + data.coursId});
	}).error($scope.isError);

	$scope.next = function() {
		if($scope.position == $scope.qcm.questions.length - 1)
			return false;

		$scope.position += 1;
		$scope.question = $scope.qcm.questions[$scope.position];
		return true;
	};
	$scope.selectAnswer = function(ans) {
		$scope.question.userAnswer = ans;

		if(!$scope.next())
			$scope.endQcm();
	};
	$scope.endQcm = function() {
		$http.post('api/addQcmResult/', $scope.getResults()).success(function(data) {
			if(data._id !== undefined)
				$location.path('/viewQcmResult/' + data._id);
			else
				$scope.isError(data);
		}).error($scope.isError);
	};
	$scope.getAnswers = function(question) {
		if(question.answers === undefined)
			return [];

		if(question.answersRandom === undefined){
			question.answersRandom = $scope.shuffleArray(angular.copy(question.answers));
		}
		else
			return question.answersRandom;
	};
	$scope.getResults = function() {
		var res = { qcmId: $scope.qcm._id,correct: 0, incorrect: 0, questions: [] };
		for (var i = $scope.qcm.questions.length - 1; i >= 0; i--) {
			var question = $scope.qcm.questions[i];
			res.questions[i] = {};

			if(question.answers === undefined)
				res.questions[i].answer = question.answer;
			else
				res.questions[i].answer = question.answers[0].value;

			res.questions[i].given = question.userAnswer;

			res.questions[i].correct = res.questions[i].given.toLowerCase() == res.questions[i].answer.toLowerCase();

			if(res.questions[i].correct)
				res.correct++;
			else
				res.incorrect++;
		};
		return res;
	};
}])
.controller('viewQcmResultCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){
	$scope.setPageInfo({name: 'Résultat de questionnaire', back:"auto"});

	$http.get('api/getQcmResult/' + $routeParams.id ).success(function(result) {
		$http.get('api/getQcm/' + result.qcmResults[0].qcmId).success(function(data) {
			$scope.results = result.qcmResults[0];
			$scope.chapitreId = data._id;
			$scope.qcm = data.qcm[0];

			for (var i = $scope.results.questions.length - 1; i >= 0; i--) {
				$scope.results.questions[i].question = $scope.qcm.questions[i];
			};

			$scope.qcmId = $scope.results.qcmId;
			$scope.results.max = $scope.results.correct + $scope.results.incorrect;
		}).error($scope.isError)
	}).error($scope.isError);
	$scope.getAnswer = function(question) {
		if(question.type === 0)
			return question.answers[0].value;
		else
			return question.answer;
	};
}])