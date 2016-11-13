
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
				return new (this.get_list())(Promise.resolve(data.map(doc => this.from_promise(Promise.resolve(doc)))));
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
					this
						.get_collection()
						.then(c => c.findOne(data, options)) :
					this
						.get_collection()
						.then(c => this
							.aggregate(c, data, Object
								.entries(options)
								.reduce((p,c) => !p.push({["$" + c[0]]: c[1] }) || p, [])
							)
							.toArray()
						)
						.then(results => results[0])
			);
		}

		static find (data = {}, options = {}, bare) {
			return this.from_cursor(
				bare ?
					c => c.find(data, options) :
					c => this.aggregate(c, data, Object.entries(options).reduce((p,c) => !p.push({["$" + c[0]]: c[1] }) || p, []))
			);
		}

		static all () {
			return this.find();
		}

		static aggregate (collection, $match, options = []) {
			return collection
				.aggregate([
					{ $match },
					...options,
					...(this.aggregations || [])
				], { allowDiskUse: true }); // possibly slower?
		}

		static update_model (model, data, options, ignore) {
			return model.get__id()
				.then(_id => this.update({ _id }, data, options, ignore));
		}

		static update (where, data, options, ignore) {
			if(!this.check_data(data) && !ignore)
				return Promise.reject("Data is missing fields, use ignore to bypass.");
			else
				return this.get_collection().update(where, data, options);
		}

		static modify_model (model, data, options, ignore) {
			return this.from_promise(model.get__id()
				.then(_id => this.modify({ _id }, data, options, ignore))
				.then(({ value }) => value));
		}

		static modify (where, data, options, ignore) {
			if(!this.check_data(data) && !ignore)
				return Promise.reject("Data is missing fields, use ignore to bypass.");
			else
				return this.get_collection().findOneAndUpdate(where, data, options);
		}

		static destroy_model (model) {
			return model.get__id().then(_id => this.destroy({ _id }));
		}

		static destroy (where) {
			return this.get_collection().remove(where);
		}

		static check_data (data) {
			return (data.$set || data.$addToSet || data.$push || data.$pull || data.$unset || data.$setOnInsert);
		}

	}

	module.exports = Store;
