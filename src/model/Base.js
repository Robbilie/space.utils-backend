
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
			return new Promise(async (res) => {
				try {

					let data = await future;

					let fieldName = name.lowercaseFirstLetter().pluralize();
					let result = data.constructor.name == "Object" ? {} : [];

					let { types } = LoadUtil.scheme(name);

					for(let key in data) {

						if(!types[key] || key == "_id")
							continue;

						if(types[key].prototype instanceof Base && depth > 0)
							result[key] = await new types[key](data[key]).toJSON(--depth);
						else if(data[key].constructor.name != types[key].name || (types[key].prototype instanceof Base && depth == 0))
							result[key] = { href: `${config.site.url}/${fieldName}/${data["id"]}/${key}/` };
						else
							result[key] = await data[key];

					}

					return res(result);
				} catch(e) { console.log(e) }

			});
		}

	}

	module.exports = Base;
