
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
			(await Promise.all(Object.entries(this.constructor.types).map(async ([field_name, field_type]) => {

				if(
					field_name == "_id" ||	// hide _id field
					!(
						typeof(data[field_name]) != "undefined" ||
						typeof(data[`${field_name}_id`]) != "undefined"
					) 	// hide if field is empty and no PK field set; TODO: use PK instead of id only
				)
					return;

				if(depth > 0 && field_type.prototype instanceof Base) {
					let model;
					if(data[field_name]) {
						model = Store.from_data(data[field_name], field_type);
					} else {
						model = field_type.get_store().find_by_pk(data[`${field_name}_id`]);
					}
					return [field_name, await model.serialize(depth - 1)];
				} else {
					if(field_type.prototype instanceof Base) {
						return [`${field_name}_id`, data[`${field_name}_id`]];
					} else {
						return [field_name, (new field_type(data[field_name])).valueOf()];
					}
				}

			})))
			.reduce(
				(p, c) => { if(!!c) p[c[0]] = c[1]; return p; },
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
