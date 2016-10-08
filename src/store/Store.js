
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

		findBy_id (_id, options, bare) {
			return this.findOne({ _id: DBUtil.to_id(_id) }, options, bare);
		}

		findOne (data = {}, options = {}, bare) {
			return (
				bare ?
					this.getCollection().findOne(data, options) :
					this.aggregate(data, Object.entries(options).reduce((p,c) => !p.push({["$" + c[0]]: c[1] }) || p, [])).toArray().then(results => results[0])
			).then(doc => new (this.getType())(doc));
		}

		find (data = {}, options = {}, bare) {
			return (
				bare ?
					this.getCollection().find(data, options) :
					this.aggregate(data, Object.entries(options).reduce((p,c) => !p.push({["$" + c[0]]: c[1] }) || p, []))
			).toArray().then(docs => docs.map(doc => new (this.getType())(doc)));
		}
		
		all () {
			return this.find({});
		}
		
		aggregate (match, options = []) {
			return this.getCollection()
				.aggregate([
					{$match: match},
					...options,
					...((LoadUtil.scheme(this.getType().name) || {}).aggregations || [])
				]/*, { allowDiskUse: true }*/); // possibly slower?
		}

		getUpdates (options = {}, timestamp) {
			return DBUtil.getOplogCursor(Object.assign(options, { ns: this.getName() }), timestamp);
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
				.then(res => new (this.getType())(res.value));
		}

		destroy (where) {
			return this.getCollection()
				.remove(where)
				.then(docs => null);
		}

		insert (data = {}) {
			return this.getCollection()
				.insertOne(data)
				.then(doc => new (this.getType())(doc.result.ok ? data : null));
		}

		findList (list, id, bare) {
			return this.find({ [id ? id : "id"]: { $in: list } }, bare);
		}

	}

	module.exports = Store;
