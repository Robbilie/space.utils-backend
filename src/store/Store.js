
	"use strict";

	const { DBUtil, LoadUtil } 		= require("util/");

	class Store {

		static from_cursor (fn) {
			return new (this.get_list())(this
				.get_collection()
				.then(c => fn(c).toArray())
				.then(docs => docs.map(doc => new (this.get_model(Promise.resolve(doc))))));
		}

		static from_data (data) {
			if(data.constructor.name == "Array")
				return new (this.get_list())(Promise.resolve(data.map(doc => new (this.get_model())(Promise.resolve(doc)))));
			else
				return new (this.get_model())(Promise.resolve(data));
		}

		static find_or_create () {}

		static find_by_pk () {}

		static get_model () {
			return LoadUtil.model(this.get_name());
		}

		static get_list () {
			return LoadUtil.model(`${this.get_name()}List`);
		}

		static get_collection () {
			return DBUtil.get_collection(this.get_name());
		}

		static get_name () {
			return this.name.slice(0, -5);
		}

		static get_updates (options, last_ts) {
			return DBUtil.get_oplog_cursor(Object.assign(options, { ns: this.get_name().toLowerCase().pluralize() }), last_ts);
		}

		static get_continuous_updates (options, last_ts, fn) {
			const local_storage = { last_ts };
			return this.get_updates(options, local_storage.last_ts).then(updates => updates.each((err, log) => {
				if(err)
					return console.log(err, new Error(), "restarting cursor…") || setImmediate(() => this.get_continuous_updates(local_storage.last_ts));
				local_storage.last_ts = log.ts;
				fn(log);
			}));
		}






		/************/

		constructor (db, type, collectionName) {
			this.type 		= type || LoadUtil.model(this.constructor.name.slice(0, -5));
			this.name 		= collectionName || this.type.name.toLowerCase().pluralize();
			this.collection = db.collection(this.name);
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
					...(this.constructor.aggregations || [])
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
