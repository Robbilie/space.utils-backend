
	"use strict";

	const { LoadUtil } 	= require("util/");
	const { Base } 		= require("model/");

	class PatchUtil {

		static model (model) {
			PatchUtil.filter(model).forEach(prop => {

				const { types } = LoadUtil.scheme(model.constructor.name);
				const field = prop.slice(3).lowercaseFirstLetter();
				const type = types[field];

				if(type.prototype instanceof Base)
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

		static filter (model) {
			return Object
				.getOwnPropertyNames(model.prototype)
				.filter(prop => model[prop].toString().slice(-2) == "{}");
		}

		static store (store) {
			PatchUtil.filter(store).forEach(prop => {

				const slt = prop.split(/(?=[A-Z_][Ia-z_$])/).map(s => s.lowercaseFirstLetter());
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

				Object.defineProperty(store.prototype, prop, {
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