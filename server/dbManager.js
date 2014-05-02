module.exports = function (db) {
	this.db = db;

	this.getUser = function(userObj, cb) {
		db.collection('users').find(userObj).toArray(cb);
	};
	this.getCours = function(userRank, cb) {
		db.collection('cours').find({rank: {$lte: userRank}}).toArray(cb);
	};
	this.getSimple = function(collection, query, cb) {
		db.collection(collection).find(query).toArray(cb);
	};
};