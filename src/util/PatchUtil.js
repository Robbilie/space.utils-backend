
	"use strict";

	const { DBUtil, LoadUtil } = require("util");
	const { _Base } = require("model");


	class PatchUtil {

		static _model (model) {
			PatchUtil._filter(model).forEach(prop => {

				const types = LoadUtil.scheme(model.constructor.name);
				const field = prop.slice(3).lowercaseFirstLetter();
				const type = types[field];

				if(type.prototype instanceof _Base)
					Object.defineProperty(model.prototype, prop, {
						value: function () {
							return (new type(
								this.getFuture()
									.then(data => data[field])
							));
						}
					});
				else
					Object.defineProperty(model.prototype, prop, {
						value: function () {
							return this.getFuture().then(data => data[field]);
						}
					});

			});
		}

		static _filter (model) {
			return Object
				.getOwnPropertyNames(model.prototype)
				.filter(prop => model[prop].toString().slice(-2) == "{}");
		}

		static model (model, filter, alias = {}) {
			PatchUtil.filter(model, filter).forEach(p => {
				// slice "get" off and lowercase the property
				// TODO : add stuff like getCorporationId()
				const type = LoadUtil.model(p.slice(3));
				Object.defineProperty(model.prototype, p, {
					value: function () {
						let obj = this.data[p.slice(3).lowercaseFirstLetter()];
						return obj && obj.constructor.name == "ObjectID" ? 
							DBUtil.getStore(alias[p.slice(3)] || p.slice(3)).then(store => store.getBy_id(obj)) : 
							(obj && type ? new (type)(obj) : (typeof(obj) != "undefined" ? obj : DBUtil.getStore(this.constructor.name).then(store => store[p](this))));
					},
					configurable: false,
					writable: false
				});
			});
		}

		static store (store, filter) {
			PatchUtil.filter(store, filter).forEach(p => {
				var slt = p.split(/(?=[A-Z_][Ia-z_$])/).map(s => s.lowercaseFirstLetter());
				var params = slt.slice(["by","where"].map(f => slt.indexOf(f) + 1).find(f => f > 0));

				var method;
				switch (slt[0]) {
					case "get":
					case "find":
						method = "aggregate";
						break;
					case "update":
					case "set":
						method = "update";
						break;
				}

				var all = slt[1] == "all";

				Object.defineProperty(store.prototype, p, {
					value: async function (...args) {
						
						var query = { [params[0]]: args[0] };
						for(let i = 2; i < params.length; i += 2) {
							query = { ["$" + params[i - 1]]: [query, { [params[i]] : args[i / 2] }]};
						}

						let res = await this[method](query);
						return all ? res : res[0];

					},
					configurable: false,
					writable: false
				});
			});
		}

		static filter (obj, filter = []) {
			return Object
				.getOwnPropertyNames(obj.prototype)
				.filter(p => [].concat(["constructor", "lookups"], filter).indexOf(p) === -1);
		}

	}

	module.exports = PatchUtil;