	"use strict";

	const { DB, Oplog, LoadUtil } = require("util/");

	class Store {

		static from_cursor (param) {
			return this.from_promise(
				(() => {
					if(param.constructor.name === "Cursor") {
						return param.toArray();
					} else {
						return param(this.collection()).toArray();
					}
				})(),
				this.get_list()
			);
		}

		static from_promise (prom, model = this.get_model()) {
			if (prom === undefined || prom.constructor.name !== "Promise")
				throw new Error("method misuse");
			return new model(prom);
		}

		static from_data (data, model) {
			if(model === undefined && data.constructor.name === "Array")
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

		static collection () {
			return DB[this.get_name().toLowerCase().pluralize()];
		}

		static get_name () {
			return this.name.slice(0, -5);
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

		static findOne (data = {}, options = {}, bare = true) {
			return this.from_promise((async () => {
				let collection = this.collection();
				if(bare === true) {
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

		static find (data = {}, options = {}, bare = false) {
			return this.from_cursor(
				bare === true ?
					c => c.find(data, options) :
					c => this.aggregate(c, data, Object.entries(options).reduce((p,c) => !p.push({["$" + c[0]]: c[1] }) || p, []))
			);
		}

		static async check_list ($in, field = "id") {
			let results = await this.collection()
				.aggregate([
					{ $match: { [field]: { $in } } },
					{ $group: { _id: "ids", ids: { $push: "$" + field } } }
				])
				.toArray();
			return results.map(({ ids }) => ids);
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
			if (this.check_data(data) === undefined)
				throw ("Data is missing fields, use ignore to bypass.");
			if (oplog === true)
				setImmediate(() => Oplog.update(this.get_name().toLowerCase().pluralize(), where, data));
			return this.collection().updateOne(where, data, options);
		}

		static replace (...args) {
			return this.collection().replaceOne(...args);
		}

		static modify_model (model, data, options, ignore) {
			return this.from_promise((async () => {
				let _id = await model.get__id();
				return (await this.modify({ _id }, data, options, ignore)).value;
			})());
		}

		static modify (where, data, options, oplog = false) {
			if (this.check_data(data) === undefined)
				throw ("Data is missing fields, use ignore to bypass.");
			if (oplog === true)
				setImmediate(() => Oplog.update(this.get_name().toLowerCase().pluralize(), where, data));
			return this.collection().findOneAndUpdate(where, data, options);
		}

		static insert_model (model, options, ignore) {
			return model.get_future()
				.then(data => this.insert(data, options, ignore));
		}

		static insert (data, options, oplog = false) {
			if (oplog === true)
				setImmediate(() => Oplog.insert(this.get_name().toLowerCase().pluralize(), data));
			return this.collection().insertOne(data, options);
		}

		static destroy_model (model) {
			return model.get__id().then(_id => this.destroy({ _id }));
		}

		static destroy (where, oplog = false) {
			if (oplog === true)
				setImmediate(() => Oplog.destroy(this.get_name().toLowerCase().pluralize(), where));
			return this.collection().remove(where);
		}

		static check_data (data) {
			return (data.$set || data.$addToSet || data.$push || data.$pull || data.$unset || data.$setOnInsert);
		}

	}

	module.exports = Store;
