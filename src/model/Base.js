
	"use strict";

	const DBUtil 					= require("util/DBUtil");
	const config 					= require("util/../../config/");

	class Base {

		constructor (data) {
			this.data = data;
		}

		getData () {
			return this.data;
		}

		get_id () {
			return this.data._id;
		}

		getStore () {
			return DBUtil.getStore(this.constructor.name);
		}

		update (...args) {
			return this.getStore().then(store => store.update({ _id: this.get_id() }, ...args));
		}

		destroy () {
			return this.getStore().then(store => store.destroy({ _id: this.get_id() }));
		}

		modify (...args) {
			return this.getStore().then(store => store.findAndModify({ _id: this.get_id() }, ...args));
		}

		toJSON () {
			return Base.toJSON(this.constructor.name.toLowerCase(), this.getData());
		}

		static getAliases () {
			return {};
		}

		static toJSON (name, obj) {
			let fieldName = name.pluralize();
			let data = obj.constructor.name == "Object" ? {} : [];

			for(let key in obj) {
				if(key == "_id")
					continue;
				switch (obj[key].constructor.name) {
					case "ObjectID":
						data[key] = { href: `${config.site.url}/${fieldName}/${obj["id"]}/${key}/` };
						break;
					default:
						data[key] = obj[key];
						break;
				}
			}

			return data;
		}

	}

	module.exports = Base;