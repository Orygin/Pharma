'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	compress = require('compression')(),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	MongoClient = require('mongodb').MongoClient,
	mongoStore = require('connect-mongo')(express),
	dbm = require('./dbManager'),
	db = {};

var app = express();

MongoClient.connect("mongodb://localhost:27017/pharma", function(err, d) {
	if(!err){
		db = d;
		dbm = new dbm(db);
		startServer();
	}
	else
		console.log('WARNING : could not connect to database');
});

function accessRights (lvl) {
	return function (req, res, next) {
		if(lvl == 5 && req.session.isConnected && (req.session.rank >= lvl || req.session._id == req.body.id))
			return next();
		else if(req.session.isConnected && req.session.rank >= lvl)
			return next();
		else
			return res.send(401);
	};
}
function easyResSend(res) {
	return (function(err, data) {
		console.dir(data);
		if(err){
			res.send(500, err);
			console.log(err);
		}
		else if(Object.prototype.toString.call( data ) === '[object Array]'){ //It's an array
			if(data.length === 1){
				res.send(200, data[0])
			}
			else{
				res.send(200, data);
			}
		}
		else if (data === undefined){
			res.send(200);
		}
		else if(typeof data === 'object'){
			res.send(200, data);
		}
		else
			res.send(200);
		});
};
function startServer () {
	// Serve static files
	app.use(express.static(__dirname + '/../app'));
	app.use(express.static(__dirname + '/../bower_components'));
	// Parse requests body
	app.use(bodyParser());
	// Compress responses
	app.use(compress);
	// Parse cookies
	app.use(cookieParser('true random number : 2'));
	// Session manager
	app.use(session({ secret: 'true random number : 2', key: 'sid', cookie: { secure: false }, store: new mongoStore({ db: db })}));


	app.get('/api/home', function(req, res){
		if(req.session.isConnected)
			dbm.getUser({_id: req.session.userid}, function(err, items) { res.send(200, items[0]) });
		else
			res.send(401);
	});

	app.post('/api/connect', function(req, res) {
		if(!req.body.name && ! req.body.password)
			return res.send(401);

		var name = req.body.name,
			password = req.body.password;

		dbm.getUser({name:name, password:password}, function (err, items) {
			if(!err && items.length == 1){
				var user = items[0];
				req.session.userid = user._id;
				req.session.isConnected = true;
				req.session.rank = user.rank;

				res.send(200, user);
			}
			else
				res.send(401);
		});
	});
	app.get('/api/destroySession', function(req, res) {
		req.session.destroy();
		res.send(401);
	});
	app.route('/api/listeCours')
		.all(accessRights(0))
		.get(function(req, res) {
			var userrank = req.session.rank;
			dbm.getCours(userrank, easyResSend(res));
		});
	app.route('/api/addCour')
		.all(accessRights(3))
		.post(function(req, res) {
			if(req.body.name === undefined && req.body.content === undefined && req.body.rank === undefined)
				return res.send(400);

			dbm.addCour({
					name: req.body.name, 
					content: req.body.content,
					rank: req.body.rank
				}, easyResSend(res));
		});
	app.route('/api/getCour/:id')
		.all(accessRights(0))
		.get(function(req, res) {
			dbm.getCour(req.session.rank, +req.params.id, easyResSend(res));
		});
	app.route('/api/editCour/:id')
		.all(accessRights(3))
		.post(function(req, res) {
			dbm.editCour(req.body, easyResSend(res));
		});
	app.route('/api/removeCour/:id')
		.all(accessRights(3))
		.get(function(req, res) {
			dbm.removeCour(+req.params.id, easyResSend(res))
		});
	app.route('/api/changeCourPosition/:id')
		.all(accessRights(3))
		.post(function(req, res) {
			db.collection('cours').findAndModify({_id: +req.params.id}, [['a', 1]], {$set: {position: req.body.value}}, {w:1}, function(err) {
				if(err && doc.count > 0)
					res.send(500, err);
				else
					res.send(200);
			});
		});

	app.route('/api/listeChapitres/:coursId')
		.all(accessRights(0))
		.get(function(req, res) {
			var coursId = req.params.coursId;
			dbm.getChapitres(coursId, easyResSend(res));
		});
	app.route('/api/addChapitre/:coursId')
		.all(accessRights(3))
		.post(function(req, res) {
			if(req.body.name === undefined && req.body.content === undefined && req.body.coursId === undefined)
				return res.send(400);

			dbm.addChapitre({
					name: req.body.name, 
					content: req.body.content,
					coursId: req.params.coursId
				}, easyResSend(res));
		});
	app.route('/api/getChapitre/:id')
		.all(accessRights(0))
		.get(function(req, res) {
			dbm.getChapitre(+req.params.id, easyResSend(res));
		});
	app.route('/api/editChapitre/:id')
		.all(accessRights(3))
		.post(function(req, res) {
			dbm.editChapitre(req.body, easyResSend(res));
		});
	app.route('/api/removeChapitre/:id')
		.all(accessRights(3))
		.get(function(req, res) {
			dbm.removeChapitre(+req.params.id, easyResSend(res))
		});
	app.route('/api/changeChapitrePosition/:id')
		.all(accessRights(3))
		.post(function(req, res) {
			db.collection('chapitres').findAndModify({_id: +req.params.id}, [['a', 1]], {$set: {position: req.body.value}}, {w:1}, function(err) {
				if(err && doc.count > 0)
					res.send(500, err);
				else
					res.send(200);
			});
		});

	app.route('/api/getUser/:id')
		.all(accessRights(5))
		.get(function(req, res) {
			dbm.getUser({_id: +req.params.id}, easyResSend(res));
		});
	app.route('/api/getUsers')
		.all(accessRights(3))
		.get(function(req, res) {
			dbm.getUsers(easyResSend(res));
		});
	app.route('/api/addUser')
		.all(accessRights(3))
		.post(function(req, res) {
			var user = {
				name: req.body.name,
				password: req.body.password,
				rank: req.body.rank,
				stats: {}
			}
			dbm.addUser(user, easyResSend(res));
		});
	app.route('/api/removeUser/:id')
		.all(accessRights(3))
		.get(function(req, res) {
			dbm.removeUser(+req.params.id, easyResSend(res));
		});
	app.route('/api/getQcm/:id')
		.all(accessRights(3))
		.get(function(req, res) {
			dbm.getQcm(+req.params.id, easyResSend(res));
		});
	app.route('/api/addQcm/:id')
		.all(accessRights(3))
		.post(function(req, res) {
			dbm.addQcm(+req.params.id, req.body, easyResSend(res));
		});
	app.route('/api/editQcm/:id')
		.all(accessRights(3))
		.post(function(req, res) {
			dbm.editQcm(+req.params.id, req.body, easyResSend(res));
		});
	app.route('/api/removeQcm/:cid/:qid')
		.all(accessRights(3))
		.get(function(req, res) {
			dbm.removeQcm(+req.params.cid, +req.params.qid, easyResSend(res));
		});
	app.route('/api/addQcmResult/')
		.all(accessRights(3))
		.post(function(req, res) {
			dbm.addQcmResult( +req.session.userid, req.body, easyResSend(res));
		});

	app.listen(80);
	console.log('Listening on port 80');
}