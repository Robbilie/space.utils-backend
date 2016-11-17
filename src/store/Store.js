
	"use strict";

	const { DBUtil, LoadUtil } 		= require("util/");

	class Store {

		static from_cursor (param) {
			return this.from_promise(
				(async () => {
					let cursor;
					if(param.constructor.name == "Cursor") {
						cursor = param;
					} else {
						let collection = await this.get_collection();
						cursor = param(collection);
					}
					let docs = await cursor.toArray();
					return Promise.all(docs.map(doc => this.from_data(doc)));
				})(),
				this.get_list()
			);
		}

		static from_promise (prom, model = this.get_model()) {
			return new model(prom);
		}

		static from_data (data) {
			if(data.constructor.name == "Array")
				return this.from_promise(Promise.resolve(data.map(doc => this.from_promise(Promise.resolve(doc)))), this.get_list());
			else
				return this.from_promise(Promise.resolve(data));
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
			return this.get_updates(options, local_storage.last_ts).then(updates => updates.forEach(
				log => local_storage.last_ts = log.ts || fn(log),
				error => console.log(err, new Error(), "restarting cursor…") || setImmediate(() => this.get_continuous_updates(local_storage.last_ts)))
			);
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
			return this.from_promise((async () => {
				let collection = await this.get_collection();
				if(bare) {
					return await collection.findOne(data, options);
				} else {
					return (await this
						.aggregate(collection, data, Object
							.entries(options)
							.reduce((p,c) => !p.push({["$" + c[0]]: c[1] }) || p, [])
						)
						.toArray())[0];
				}
			})());
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
				return this.get_collection().then(collection => collection.updateOne(where, data, options));
		}

		static modify_model (model, data, options, ignore) {
			return this.from_promise((async () => {
				let _id = await model.get__id();
				return (await this.modify({ _id }, data, options, ignore)).value;
			})());
		}

		static modify (where, data, options, ignore) {
			if(!this.check_data(data) && !ignore)
				return Promise.reject("Data is missing fields, use ignore to bypass.");
			else
				return this.get_collection().then(collection => collection.findOneAndUpdate(where, data, options));
		}

		static destroy_model (model) {
			return model.get__id().then(_id => this.destroy({ _id }));
		}

		static destroy (where) {
			return this.get_collection().then(collection => collection.remove(where));
		}

		static check_data (data) {
			return (data.$set || data.$addToSet || data.$push || data.$pull || data.$unset || data.$setOnInsert);
		}

	}

	module.exports = Store;
