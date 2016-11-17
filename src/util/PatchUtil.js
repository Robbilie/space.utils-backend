
	"use strict";

	const { Base } 		= require("model/");

	class PatchUtil {

		static model (model) {
			PatchUtil.filter(model).forEach(property => {

				const field 	= property.split("_").slice(1).join("_");
				const type 		= model.types[field];

				if(type.prototype instanceof Base) {
					const store = type.get_store();
					Object.defineProperty(model.prototype, property, {
						value: async function () {
							let data = this.get_future();
							if(data[field]) {
								return store.from_data(data[field]);
							} else {
								return store.find_by_pk(data[`${field}_id`]);
							}
						}
					});
				} else {
					Object.defineProperty(model.prototype, property, {
						value: function () {
							return this.get_future().then(data => data[field] || data[`${field}_id`]);
						}
					});
				}

			});
		}

		static filter (model) {
			return Object
				.getOwnPropertyNames(model.prototype)
				.filter(property => model.prototype[property].toString().slice(-2) == "{}");
		}

		static store (store) {
			PatchUtil.filter(store).forEach(property => {

				const slt = property.split("_");
				const params = slt.slice(["by","where"].map(f => slt.indexOf(f) + 1).find(f => f > 0));

				var method;
				switch (slt[0]) {
					case "find":
						method = "find" + (slt[1] == "All" ? "" : "One");
						break;
					case "update":
						method = "update";
						break;
				}

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
