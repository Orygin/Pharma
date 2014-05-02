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

function getNextSequence(name) {
   var ret = db.counters.findAndModify(
          {
            query: { _id: name },
            update: { $inc: { count: 1 } },
            new: true
          }
   );

   return ret.seq;
}
function accessRights (lvl) {
	return function (req, res, next) {
		if(req.session.isConnected && req.session.rank >= lvl)
			return next();
		else
			return res.send(401);
	};
}
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
		console.dir(req.session);
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
			dbm.getCours(userrank, function(err, items) {
				if(!err)
					res.send(200, items);
				else
					res.send(500);
			});
		});

	app.listen(80);
	console.log('Listening on port 80');
}