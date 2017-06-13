
	"use strict";

	const { Base } = require("model/");

	class PatchUtil {

		static model (model) {
			PatchUtil.filter(model).forEach(property => {
				const field = property.slice(4);
				const type = model.types[field];

				const value = (type !== undefined && type.prototype instanceof Base) ? function () {
					return type.create(this.then(data => data[field] || type.getStore().find_by_pk(data[`${field}_id`]).getFuture()));
				} : function () {
					return this.then(data => data[field] || data[`${field}_id`]);
				};
				Object.defineProperty(model.prototype, property, { value });
			});
		}

		static filter (model) {
			return Object
				.getOwnPropertyNames(model.prototype)
				.filter(property => property.slice(0, 4) === "get_" && model.prototype[property].toString().slice(-2) === "{}");
		}

		static store (store) {
			PatchUtil.filter(store).forEach(property => {

				const slt = property.split("_");
				const params = slt.slice(["by","where"].map(f => slt.indexOf(f) + 1).find(f => f > 0));

				let tmpmethod;
				switch (slt[0]) {
					case "find":
						tmpmethod = "find" + (slt[1] == "All" ? "" : "One");
						break;
					case "update":
						tmpmethod = "update";
						break;
				}

				const method = tmpmethod;

				Object.defineProperty(store, property, {
					value: function (...args) {

						let query = { [params[0]]: args[0] };
						for(let i = 2; i < params.length; i += 2) {
							query = { ["$" + params[i - 1]]: [query, { [params[i]] : args[i / 2] }]};
						}

						return this[method](query);

					}
				});

			});
		}

	}

	module.exports = PatchUtil;
