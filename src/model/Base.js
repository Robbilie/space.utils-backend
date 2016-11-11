
	"use strict";

	const { DBUtil, LoadUtil } = require("util/");

	class Base {



		constructor (data) {
			this.future = (data && data.constructor.name == "Promise" ? data : Promise.resolve(data))
				.then(res =>
					res && res.constructor.name != "Object" && res.constructor.name != "Array" ?
						this
							.getStore()
							.then(store => store.findOrCreate ? store.findOrCreate(res) : store.findByPK(res))
							.then(cls => cls.getFuture()) :
						res
				);
		}

		getFuture () {
			return this.future;
		}

		getStore () {
			return DBUtil.getStore(this.constructor.name);
		}

		update (...args) {
			return this.getStore().then(async (store) => store.update({ _id: await this.get__id() }, ...args));
		}

		destroy () {
			return this.getStore().then(async (store) => store.destroy({ _id: await this.get__id() }));
		}

		modify (...args) {
			return this.getStore().then(async (store) => store.findAndModify({ _id: await this.get__id() }, ...args));
		}

		valueOf () {
			return this;
		}

		isNull () {
			return this.getFuture().then(data => !data);
		}

		get__id () {
			return this.getFuture().then(data => data._id);
		}

		serialize (depth = 2) {
			return this.constructor.serialize(this.constructor.name, this.getFuture(), depth);
		}

		static serialize (name, future, depth = 0) {
			return future.then(data => Promise.all(Object.entries((LoadUtil.model(name)).types).map(([key, t]) => {

				if(key == "_id" || !(data[key] || data[key + "ID"]))
					return Promise.resolve();

				if(!t.name && depth > 0) {
					let type = t.name ? t : LoadUtil.model(t);
					return (new type(data[key] || data[key + "ID"]).serialize(depth - 1)).then(res => [key, res]);
				} else if(((data[key] || data[key + "ID"]) && (data[key] || data[key + "ID"]).constructor.name != (t.name || t)) || (!t.name && depth == 0)) {
					return Promise.resolve([key, { href: `https://api.${process.env.HOST}/${name.lowercaseFirstLetter().pluralize()}/${data["id"]}/${key}/` }]);
				} else {
					return Promise.resolve([key, data[key]]);
				}

			})).then(results => results.reduce((p, c) => typeof(c ? p[c[0]] = c[1]: true) == "undefined" || p, data.constructor.name == "Object" ? {} : [])));
		}

	}

	module.exports = Base;

	/* TYPE DEFINITION */

	const { ObjectId } = require("mongodb");

	Base.types = {
		_id: ObjectId
	};
