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
	this.getUsers = function(cb) {
		db.collection('users').find({}, {password: 0}).toArray(cb);
	};
	this.addUser = function(user, cb) {
		this.insertSimple('users', user, cb);
	};
	this.removeUser = function(id, cb) {
		db.collection('users').remove({_id: id}, {w:1}, cb);
	};
	this.getCours = function(userRank, cb) {
		db.collection('cours').find({rank: {$lte: userRank}}).toArray(cb);
	};
	this.getCour = function(userRank, id, cb) {
		db.collection('cours').find({_id: id, rank: {$lte: userRank}}).toArray(cb);	
	};
	this.removeCour = function(id, cb) {
		db.collection('cours').remove({_id: id}, {w:1}, cb);
		var cid = id + "";
		db.collection('chapitres').remove({coursId: cid}, {w:1}, cb);
	};
	this.editCour = function(cours, cb) {
		db.collection('cours').update({_id: cours._id}, {$set: cours}, {w: 1}, cb);
	};
	this.addCour = function(cours, cb) {
		cours.chapitreCount = 0;
		cours.position = 0;
		this.insertSimple('cours', cours, cb);
	};
	this.getChapitres = function(id, cb) {
		db.collection('chapitres').find({coursId: id}, {content: 0}).toArray(cb);
	};
	this.getChapitre = function(id, cb) {
		db.collection('chapitres').find({_id: id}).toArray(cb);
	};
	this.removeChapitre = function(id, cb) {
		this.getChapitre(id, function(err, doc) {
			db.collection('chapitres').remove({_id: id}, {w:1}, cb);
			db.collection('cours').findAndModify({_id: +(doc[0].coursId)}, [['a', 1]], {$inc:{chapitreCount: -1}}, {}, function(){});
		})
	};
	this.editChapitre = function(chapitre, cb) {
		db.collection('chapitres').update({_id: chapitre._id}, {$set: chapitre}, {w: 1}, cb);
	};
	this.addChapitre = function(chapitre, cb) {
		chapitre.position = 0;
		this.insertSimple('chapitres', chapitre, cb);
		db.collection('cours').findAndModify({_id: +chapitre.coursId}, [['a', 1]], {$inc:{chapitreCount: 1}}, {}, function(){});
	};
	this.getQcm = function(id, cb) {
		db.collection('chapitres').find({qcm: {$elemMatch: {_id: id}}}, {coursId: 1, qcm: {$elemMatch: {_id: id} } }).toArray(cb);
	};
	this.addQcm = function(cid, data, cb) {
		this.getNexSequence('qcm', function(count) {
			data._id = count;
			db.collection('chapitres').update({_id: cid}, {$push: { qcm: data}}, {w:1}, cb);
		});
	};
	this.editQcm = function(id, qcm, cb) {
		db.collection('chapitres').update({qcm: {$elemMatch: {_id: id}}}, {$set: {'qcm.$': qcm}}, {w: 1}, cb);
	};
	this.removeQcm = function(cid, qid, cb) {
		db.collection('chapitres').update({_id: cid}, { $pull: { qcm: { _id: qid } } }, {w:1}, cb);
	};
	this.addQcmResult = function(uid, result, cb) {
		this.getNexSequence('qcmResults', function(count) {
			result._id = count;
			db.collection('users').update({_id: uid}, {$push: { qcmResults: result}}, {w:1}, function(err, data) {
				cb(err, {_id: count});
			});
		});
	};
	this.getQcmResult = function(id, cb) {
		db.collection('users').find({qcmResults: {$elemMatch: {_id: id}}}, {qcmId: 1, qcmResults: {$elemMatch: {_id: id} } }).toArray(cb);
	};
};