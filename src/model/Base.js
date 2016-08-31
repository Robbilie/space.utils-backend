
	"use strict";

	const { DBUtil, LoadUtil } 	= require("util/");
	const config 							= require("util/../../config/");

	class Base {

		constructor (data) {
			this.future = (data && data.constructor.name == "Promise" ? data : Promise.resolve(data))
				.then(res =>
					res && res.constructor.name != "Object" && res.constructor.name != "Array" ?
						this.getStore().findByPK(res) :
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

		toJSON () {
			return Base.toJSON(this.constructor.name, this.getFuture());
		}

		static toJSON (name, future) {
			return async () => {
				
				let data = await future;

				let fieldName = name.pluralize();
				let result = data.constructor.name == "Object" ? {} : [];
	
				let { types } = LoadUtil.scheme(name);

				for(let key in data) {

					if(!types[key])
						continue;

					if(data[key].constructor.name != types[key].name)
						result[key] = { href: `${config.site.url}/${fieldName}/${obj["id"]}/${key}/` };
					else if(types[key].prototype instanceof Base)
						result[key] = await new types[key](data[key]).toJSON();
					else
						result[key] = data[key];

				}

				return result;
				
			};
		}

	}

	module.exports = Base;
