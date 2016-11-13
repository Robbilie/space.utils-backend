
	"use strict";

	const { DBUtil } = require("util/");

	class Base {

		constructor (future_data) {
			this.future_data = future_data;
		}

		get_future () {
			return this.future_data;
		}

		static get_store () {
			return DBUtil.get_store(this.name);
		}

		valueOf () {
			return this;
		}

		is_null () {
			return this.getFuture().then(data => !data);
		}

		get__id () {
			return this.getFuture().then(data => data._id);
		}

		async serialize (depth = 2) {
			const data = this.get_future();
			const results = await Promise.all(Object.entries(this.constructor.types).map(async ([field_name, field_type]) => {

				if(field_name == "_id" || !(data[field_name] || data[`${field_name}_id`]))
					return;

				if(depth > 0) {
					if(field_type.prototype instanceof Base) {
						if(data[field_name]) {
							return [field_name, await field_type.get_store().from_data(data[field_name]).serialize(depth - 1)];
						} else {
							return [field_name, await field_type.get_store().find_by_pk(data[`${field_name}_id`]).serialize(depth - 1)];
						}
					} else {
						return [field_name, (new field_type(data[field_name])).valueOf()];
					}
				//} else if (depth == 0 || ((data[field_name] || data[`${field_name}_id`] || { constructor: { name: "" } }).constructor.name != field_type.name)) {
				//	return [field_name, { href: `https://api.${process.env.HOST}/${this.constructor.name.lowercaseFirstLetter().pluralize()}/${data["id"]}/${field_name}/` }];
				} else {
					return [field_name, data[field_name]];
				}

			}));
			return results
				.filter(c => !!c)
				.reduce(
					(p, c) => { p[c[0]] = c[1]; return p; },
					data.constructor.name == "Object" ? {} : []
				);
		}

	}

	module.exports = Base;

	/* TYPE DEFINITION */

	const { ObjectID } = require("mongodb");

	Base.types = {
		_id: ObjectID
	};
