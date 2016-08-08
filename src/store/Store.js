
	"use strict";

	const DBUtil 					= require("util/DBUtil");
	const LoadUtil 					= require("util/LoadUtil");
	const config 					= require("util/../../config/");

	class Store {

		constructor (db, type, collectionName) {
			this.type 		= type || LoadUtil.model(this.constructor.name.slice(0, -5));
			this.name 		= collectionName || this.type.prototype.constructor.name.toLowerCase() + "s";
			this.collection = db.collection(config.database.prefix + this.name);
		}

		aggregate (data, lookups = [], intercept) {
			return this.collection
				.aggregate([{ $match: data }, ...[].concat.apply([], lookups
						.map(field => (
							{ 
								from: 			field.from 			|| field.split(".").slice(-1)[0].pluralize(), 
								localField: 	field.localField 	|| field,
								foreignField: 	field.foreignField 	|| "_id",
								as: 			field.as 			|| (field.localField || field) 
							}
						))
						.map(field => [
							{ 
								$lookup: field
							},
							{ 
								$unwind: { 
									path: 		"$" + field.localField, 
									preserveNullAndEmptyArrays: true
								}
							}
						]))
				])
				.toArray()
				.then(docs => intercept ? docs.map(intercept) : docs)
				.then(docs => docs.map(doc => new this.type(doc)));
		}

		get (data = {}, options) {
			return this.collection
				.findOne(data, options)
				.then(doc => doc ? new this.type(doc) : doc);
		}

		getAll (data = {}, options) {
			return this.collection
				.find(data, options)
				.toArray()
				.then(docs => docs.map(doc => new this.type(doc)));
		}

		all () {
			return this.getAll();
		}

		getBy_id (_id) {
			return this.get({ _id: DBUtil.to_id(_id) });
		}

		getUpdates (op) {
			return DBUtil.getOplogCursor(Object.assign({ ns: this.name }, op ? {op} : {}));
		}

		update (where, data, options, ignore) {
			if(!(data.$set || data.$addToSet || data.$push || data.$pull || data.$unset || data.$setOnInsert) && !ignore) return Promise.reject("No $set, $setOnInsert, $addToSet, $unset, $push or $pull found, use ignore to bypass.");
			return this.collection
				.update(where, data, options)
				.then(docs => null);
		}

		findAndModify (where, arr, data, options, ignore) {
			if(!(data.$set || data.$addToSet || data.$push || data.$pull || data.$unset || data.$setOnInsert) && !ignore) return Promise.reject("No $set, $setOnInsert, $addToSet, $unset, $push or $pull found, use ignore to bypass.");
			return this.collection
				.findAndModify(where, arr, data, options)
				.then(res => res.value ? new this.type(res.value) : null);
		}

		delete (where) {
			return this.collection
				.remove(where)
				.then(docs => null);
		}

		insert (data = {}) {
			return this.collection
				.insertOne(data)
				.then(doc => doc.result.ok ? new this.type(data) : null);
		}

		getList (list, id) {
			return this.getAll({ [id ? id : "id"]: { $in: list } });
		}

	}

	module.exports = Store;