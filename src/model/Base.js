
	"use strict";

	const { DBUtil, LoadUtil } 		= require("util/");
	const config 					= require("util/../../config/");

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
			return this.getStore().then(async (store) => store.update({ _id: await this.get_id() }, ...args));
		}

		destroy () {
			return this.getStore().then(async (store) => store.destroy({ _id: await this.get_id() }));
		}

		modify (...args) {
			return this.getStore().then(async (store) => store.findAndModify({ _id: await this.get_id() }, ...args));
		}

		valueOf () {
			return this;
		}

		isNull () {
			return this.getFuture().then(data => !data);
		}

		get_id () {
			return this.getFuture().then(data => data._id);
		}

		toJSON (depth = 2) {
			return Base.toJSON(this.constructor.name, this.getFuture(), depth);
		}

		static toJSON (name, future, depth = 0) {
			return new Promise(resolve => future.then(data => {

				const result = data.constructor.name == "Object" ? {} : [];
				const { types } = LoadUtil.scheme(name);

				Promise.all(Object.entries(data).map(([key, value]) => {

					if(!types[key] || key == "_id")
						return Promise.resolve();

					let type = types[key].name ? types[key] : LoadUtil.model(types[key]);

					if(type.prototype instanceof Base && depth > 0) {
						return (new type(data[key]).toJSON(depth - 1)).then(res => {
							result[key] = res;
							return Promise.resolve();
						});
					} else if(data[key].constructor.name != type.name || (type.prototype instanceof Base && depth == 0)) {
						result[key] = { href: `${config.site.url}/${name.lowercaseFirstLetter().pluralize()}/${data["id"]}/${key}/` };
						return Promise.resolve();
					} else {
						return Promise.resolve().then(() => data[key]).then(res => {
							result[key] = res;
							return Promise.resolve();
						});
					}

				})).then(() => resolve(result));
			}));

			/*
			return new Promise(async (res) => {
				try {

					let data = await future;

					let fieldName = name.lowercaseFirstLetter().pluralize();
					let result = data.constructor.name == "Object" ? {} : [];

					let { types } = LoadUtil.scheme(name);

					for(let key in data) {

						if(!types[key] || key == "_id")
							continue;

						let type = types[key].name ? types[key] : LoadUtil.model(types[key]);

						if(type.prototype instanceof Base && depth > 0)
							result[key] = await new type(data[key]).toJSON(depth - 1);
						else if(data[key].constructor.name != type.name || (type.prototype instanceof Base && depth == 0))
							//result[key] = { href: `${config.site.url}/${type.name.lowercaseFirstLetter().pluralize()}/${data[key].id || data[key]}/` };
							result[key] = { href: `${config.site.url}/${fieldName}/${data["id"]}/${key}/` };
						else
							result[key] = await data[key];

					}

					return res(result);
				} catch(e) { console.log(e, new Error()) }

			});
			*/
		}

	}

	module.exports = Base;
