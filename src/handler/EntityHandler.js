
	"use strict";

	const { InputUtil, LoadUtil } 	= require("util/");
	const { BaseHandler } 			= require("handler/");

	class EntityHandler extends BaseHandler {

		static filter () {
			return ({ swagger: { params }, body: { filter, options } }, { json }) =>
				LoadUtil
					.model(this.name.slice(0, -7))
					.from_cursor(c => c
						.find(InputUtil.sanitize(filter), InputUtil.limit(options))
					)
					.map(item => item.toJSON())
					.toJSON()
					.then(items => json({ items }));
		}

		static get_by_id () {
			return ({ swagger: { params } }, { json }) =>
				LoadUtil
					.model(this.name.slice(0, -7))
					.find_or_create(params[this.name.slice(0, -7).toLowerCase() + "_id"].value)
					.toJSON()
					.then(json);
		}

	}

	module.exports = EntityHandler;
