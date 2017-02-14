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
					return await cursor.toArray();
				})(),
				this.get_list()
			);
		}

		static from_promise (prom, model = this.get_model()) {
			if (!prom || prom.constructor.name != "Promise")
				throw new Error("method misuse");
			return new model(prom);
		}

		static from_data (data, model) {
			if(!model && data.constructor.name == "Array")
				return this.from_promise(Promise.resolve(data), this.get_list());
			else
				return this.from_promise(Promise.resolve(data), model);
		}

		static find_or_create () {}

		static get_model () {
			return LoadUtil.model(this.get_name());
		}

		static get_list () {
			return LoadUtil.model(`${this.get_name()}List`);
		}

		static get_collection () {
			return DBUtil.get_collection(this.get_name().toLowerCase().pluralize());
		}

		static get_name () {
			return this.name.slice(0, -5);
		}

		static get_updates (options, last_ts) {
			return DBUtil.get_oplog_cursor(Object.assign(options, { ns: this.get_name().toLowerCase().pluralize() }), last_ts);
		}

		static get_continuous_updates (options, last_ts, fn) {
			const local_storage = { last_ts };
			this.get_updates(options, local_storage.last_ts).then(updates => {
				updates.forEach(
					log => !(local_storage.last_ts = log.ts) || fn(log),
					error => console.log(error, "restarting", JSON.stringify(options), "cursor…") || this.get_continuous_updates(options, local_storage.last_ts, fn)
				)
			});
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

		static aggregate (collection, $match, options = [], allowDiskUse = false) {
			return collection
				.aggregate([
					{ $match },
					...options,
					...(this.aggregations || [])
				], { allowDiskUse }); // possibly slower?
		}

		static update_model (model, data, options, ignore) {
			return model.get__id()
				.then(_id => this.update({ _id }, data, options, ignore));
		}

		static update (where, data, options, oplog = false) {
			if (!this.check_data(data)) {
				return Promise.reject("Data is missing fields, use ignore to bypass.");
			} else {
				if (oplog)
					DBUtil.oplog({ op: "u", ns: this.get_name().toLowerCase().pluralize(), o: data, o2: where });
				return this.get_collection().then(collection => collection.updateOne(where, data, options));
			}
		}

		static modify_model (model, data, options, ignore) {
			return this.from_promise((async () => {
				let _id = await model.get__id();
				return (await this.modify({ _id }, data, options, ignore)).value;
			})());
		}

		static modify (where, data, options, oplog = false) {
			if (!this.check_data(data)) {
				return Promise.reject("Data is missing fields, use ignore to bypass.");
			} else {
				if (oplog)
					setImmediate(() => DBUtil.oplog({ op: "u", ns: this.get_name().toLowerCase().pluralize(), o: where, o2: data }));
				return this.get_collection().then(collection => collection.findOneAndUpdate(where, data, options));
			}
		}

		static insert_model (model, options, ignore) {
			return model.get_future()
				.then(data => this.insert(data, options, ignore));
		}

		static insert (data, options, oplog = false) {
			if (oplog)
				setImmediate(() => DBUtil.oplog({ op: "i", ns: this.get_name().toLowerCase().pluralize(), o: data }));
			return this.get_collection().then(collection => collection.insertOne(data, options));
		}

		static destroy_model (model) {
			return model.get__id().then(_id => this.destroy({ _id }));
		}

		static destroy (where, oplog = false) {
			if (oplog)
				setImmediate(() => DBUtil.oplog({ op: "d", ns: this.get_name().toLowerCase().pluralize(), o: where }));
			return this.get_collection().then(collection => collection.remove(where));
		}

		static check_data (data) {
			return (data.$set || data.$addToSet || data.$push || data.$pull || data.$unset || data.$setOnInsert);
		}

	}

	module.exports = Store;
