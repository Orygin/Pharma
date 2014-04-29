var express = require('express'),
	bodyParser = require('body-parser'),
	compress = require('compression')(),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	MongoClient = require('mongodb').MongoClient,
	mongoStore = require('connect-mongo')(express),
	dbm = {},
	db = {};

var app = express();

MongoClient.connect("mongodb://localhost:27017/pharma", function(err, d) {
	if(!err){
		db = d;
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
			next();
		else
			res.send(401);
	}
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
		if(req.session.isConnected)
			res.send(200, req.session.accountInfo);
		else
			res.send(401);
	});

	app.post('/api/connect', function(req, res) {
		if(!req.body.name && ! req.body.password)
			return res.send(401);

		var name = req.body.name,
			password = req.body.password;

		db.collection('users').find({name:name, password:password}).toArray(function (err, items) {
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
	app.route('/api/listeCours')
		.all(accessRights(0))
		.get(function(req, res) {
			var userrank = req.session.rank;
			db.collection('cours').find({rank: {$gte: userrank}}).toArray(function(err, items) {
				if(!err)
					res.send(200, items);
				else
					res.send(500);
			};)
		});


	app.listen(80);
	console.log('Listening on port 80');
}