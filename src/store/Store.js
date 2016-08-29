
	"use strict";

	const { DBUtil, LoadUtil } 		= require("util/");
	const config 					= require("util/../../config/");

	class Store {

		constructor (db, type, collectionName) {
			this.type 		= type || LoadUtil.model(this.constructor.name.slice(0, -5));
			this.name 		= collectionName || this.type.name.toLowerCase().pluralize();
			this.collection = db.collection(config.database.prefix + this.name);
		}

		getType () {
			return this.type;
		}

		getName () {
			return this.name;
		}

		getCollection () {
			return this.collection;
		}

		getPK () {
			return "_id";
		}

		findByPK (pk) {
			return this.findOne({ [this.getPK()]: pk });
		}

		findBy_id (_id, bare) {
			return this.findOne({ _id: DBUtil.to_id(_id) }, null, bare);
		}

		findOne (data = {}, options, bare) {
			return (
				bare ?
					this.getCollection().findOne(data, options) :
					this.aggregate(data).toArray().then(results => results[0])
			).then(doc => new this.getType()(doc));
		}

		find (data = {}, options, bare) {
			return (
				bare ?
					this.getCollection().find(data, options) :
					this.aggregate(data)
			).toArray().then(docs => docs.map(doc => new this.getType()(doc)));
		}
		
		all (bare) {
			return find({}, null, bare);
		}
		
		aggregate (match) {
			return this.getCollection()
				.aggregate([
					{ $match: match },
					...((LoadUtil.scheme(this.getType().name) || {}).aggregations || [])
				]);
		}

		getUpdates (op) {
			return DBUtil.getOplogCursor(Object.assign({ ns: this.getName() }, op ? { op } : {}));
		}

		update (where, data, options, ignore) {
			if(!(data.$set || data.$addToSet || data.$push || data.$pull || data.$unset || data.$setOnInsert) && !ignore) return Promise.reject("No $set, $setOnInsert, $addToSet, $unset, $push or $pull found, use ignore to bypass.");
			return this.getCollection()
				.update(where, data, options)
				.then(docs => null);
		}

		findAndModify (where, arr, data, options, ignore) {
			if(!(data.$set || data.$addToSet || data.$push || data.$pull || data.$unset || data.$setOnInsert) && !ignore) return Promise.reject("No $set, $setOnInsert, $addToSet, $unset, $push or $pull found, use ignore to bypass.");
			return this.getCollection()
				.findAndModify(where, arr, data, options)
				.then(res => res.value ? new this.getType()(res.value) : null);
		}

		destroy (where) {
			return this.getCollection()
				.remove(where)
				.then(docs => null);
		}

		insertOne (data = {}) {
			return this.getCollection()
				.insertOne(data)
				.then(doc => doc.result.ok ? new this.getType()(data) : null);
		}

		findList (list, id, bare) {
			return this.find({ [id ? id : "id"]: { $in: list } }, bare);
		}

	}

	module.exports = Store;