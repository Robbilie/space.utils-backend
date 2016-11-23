
	"use strict";

	const { DBUtil } = require("util/");
	const { Store } = require("store/");

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
			return this.get_future().then(data => !data);
		}

		get__id () {
			return this.get_future().then(data => data._id);
		}

		async serialize (depth = 2) {
			const data = await this.get_future();
			const results = await Promise.all(Object.entries(this.constructor.types).map(async ([field_name, field_type]) => {

				if(
					field_name == "_id" ||								// hide _id field
					!(data[field_name] || data[`${field_name}_id`]) ||	// hide if field is empty and no PK field set; TODO: use PK instead of id only
					depth == 0 											// if depth limit reached go home
				)
					return;

				if(field_type.prototype instanceof Base) {
					if(data[field_name]) {
						return [field_name, await Store.from_data(data[field_name], field_type).serialize(depth - 1)];
					} else {
						return [field_name, await field_type.get_store().find_by_pk(data[`${field_name}_id`]).serialize(depth - 1)];
					}
				} else {
					return [field_name, (new field_type(data[field_name])).valueOf()];
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
