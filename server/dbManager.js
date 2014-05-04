module.exports = function (db) {
	this.db = db;

	this.getNexSequence = function(name, cb) {
		db.collection('counters').findAndModify({ _id: name }, [['a', 1]], { $inc: { count: 1 } }, {new: true}, function(err, doc) {
			cb(doc.count);
		});
	};
	this.insertSimple = function(collection, insertion, cb) {
		this.getNexSequence(collection, function(counter) {
			insertion._id = counter;
			db.collection(collection).insert(insertion, {w:1}, cb);
		})
	};
	this.getSimple = function(collection, query, cb) {
		db.collection(collection).find(query).toArray(cb);
	};
	this.getUser = function(userObj, cb) {
		db.collection('users').find(userObj).toArray(cb);
	};
	this.getCours = function(userRank, cb) {
		db.collection('cours').find({rank: {$lte: userRank}}).toArray(cb);
	};
	this.getCour = function(userRank, id, cb) {
		db.collection('cours').find({_id: id, rank: {$lte: userRank}}).toArray(cb);	
	};
	this.removeCour = function(id, cb) {
		db.collection('cours').remove({_id: id}, {w:1}, cb);
	};
	this.editCour = function(cours, cb) {
		db.collection('cours').update({_id: cours._id}, {$set: cours}, {w: 1}, cb);
	};
	this.getChapitres = function(id, cb) {
		db.collection('chapitres').find({coursId: id}).toArray(cb);
	};
	this.getChapitre = function(id, cb) {
		db.collection('chapitres').find({_id: id}).toArray(cb);
	};
	this.removeChapitre = function(id, cb) {
		db.collection('chapitres').remove({_id: id}, {w:1}, cb);
	};
	this.editChapitre = function(chapitre, cb) {
		db.collection('chapitres').update({_id: chapitre._id}, {$set: chapitre}, {w: 1}, cb);
	};
};