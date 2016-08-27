
	"use strict";

	const { PatchUtil, DBUtil, LoadUtil } = require("util");

	class _Base {

		constructor (data) {
			this.future = (data.constructor.name == "Promise" ? data : Promise.resolve(data))
				.then(res =>
					res && res.constructor.name != "Object" && res.constructor.name != "Array" ?
						this.getStore().getById(res) :
						res
				);
		}

		getStore () {
			return DBUtil.getStore(this.constructor.name);
		}

		getFuture () {
			return this.future;
		}

		valueOf () {
			return this;
		}

		isNull () {
			return this.getFuture().then(data => !data);
		}

		get_id () {}

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
						results[key] = data[key];
					
				}

				return result;
				
			};
		}

	}

	PatchUtil._model(_Base);

	module.exports = _Base;
