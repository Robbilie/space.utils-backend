
	"use strict";

	const DBUtil 					= require("util/DBUtil");
	const LoadUtil 					= require("util/LoadUtil");
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
					/*
					case "Object":
						let m1 = LoadUtil.model(name.capitalizeFirstLetter());
						let k1 = m1 && m1.getAliases ? (m1.getAliases()[key.capitalizeFirstLetter()] || key).toLowerCase() : key;
						data[key] = Base.toJSON(k1, obj[key]);
						break;
					case "Array":
						let m2 = LoadUtil.model(name.capitalizeFirstLetter());
						let k2 = m2 && m2.getAliases ? (m2.getAliases()[key.capitalizeFirstLetter()] || key).toLowerCase() : key;
						data[key] = obj[key].map(el => Base.toJSON(k2, el));
						break;
					*/
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