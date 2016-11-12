
	"use strict";

	const { DBUtil, LoadUtil } 		= require("util/");

	class Store {

		static from_cursor (param) {
			return new (this.get_list())(this
				.get_collection()
				.then(c => (param.constructor.name == "Cursor" ? param : param(c)).toArray())
				.then(docs => docs.map(doc => this.from_data(doc))));
		}

		static from_promise (prom) {
			return new (this.get_model(prom));
		}

		static from_data (data) {
			if(data.constructor.name == "Array")
				return new (this.get_list())(Promise.resolve(data.map(doc => new (this.get_model())(Promise.resolve(doc)))));
			else
				return new (this.get_model())(Promise.resolve(data));
		}

		static find_or_create () {}

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

		static get_pk () {
			return "_id";
		}

		static find_by_pk (pk, ...args) {
			return this.findOne({ [this.get_pk()]: pk }, ...args);
		}

		static find_by__id (_id, ...args) {
			return this.findOne({ _id }, ...args);
		}

		static findOne (data = {}, options = {}, bare) {
			return this.from_promise(
				bare ?
					this.getCollection().findOne(data, options) :
					this.aggregate(data, Object.entries(options).reduce((p,c) => !p.push({["$" + c[0]]: c[1] }) || p, [])).toArray().then(results => results[0])
			);
		}

		static find (data = {}, options = {}, bare) {
			return this.from_cursor(
				bare ?
					this.getCollection().find(data, options) :
					this.aggregate(data, Object.entries(options).reduce((p,c) => !p.push({["$" + c[0]]: c[1] }) || p, []))
			);
		}

		static all () {
			return this.find();
		}

		static aggregate ($match, options = []) {
			return this.get_collection()
				.aggregate([
					{ $match },
					...options,
					...(this.aggregations || [])
				], { allowDiskUse: true }); // possibly slower?
		}




		/************/

		constructor (db, type, collectionName) {
			this.type 		= type || LoadUtil.model(this.constructor.name.slice(0, -5));
			this.name 		= collectionName || this.type.name.toLowerCase().pluralize();
			this.collection = db.collection(this.name);
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

	}

	module.exports = Store;
