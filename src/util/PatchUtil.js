
	"use strict";

	const DBUtil 					= require("util/DBUtil");

	class PatchUtil {

		static model (model, filter) {
			PatchUtil.filter(model, filter).forEach(p => {
				// slice "get" off and lowercase the property
				// TODO : add stuff like getCorporationId()
				Object.defineProperty(model.prototype, p, {
					value: function () {
						let obj = this.data[p.slice(3).toLowerCase()];
						return obj && obj.constructor.name == "ObjectId" ? 
							DBUtil.getStore(p.slice(3)).then(store => store.getBy_id(obj)) : 
							obj;
					},
					configurable: false,
					writable: false
				});
			});
		}

		static store (store, filter) {
			PatchUtil.filter(store, filter).forEach(p => {
				var slt = p.split(/(?=[A-Z_])/).map(s => s.toLowerCase());
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
				.filter(p => [].concat(["constructor"], filter).indexOf(p) === -1);
		}

	}

	module.exports = PatchUtil;