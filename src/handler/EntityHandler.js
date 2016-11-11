
	"use strict";

	const { InputUtil, LoadUtil } 	= require("util/");
	const { BaseHandler } 			= require("handler/");

	class EntityHandler extends BaseHandler {

		static filter () {
			return ({ swagger: { params }, body: { filter, options } }, { json }) =>
				LoadUtil
					.model(`${this.name.slice(0, -7)}List`)
					.from_cursor(c => c
						.find(InputUtil.sanitize(filter), InputUtil.limit(options))
					)
					.serialize()
					.then(items => json({ items }));
		}

		static get_by_id () {
			return ({ swagger: { params } }, { json }) =>
				LoadUtil
					.model(this.name.slice(0, -7))
					.find_or_create(params[this.name.slice(0, -7).toLowerCase() + "_id"].value)
					.serialize()
					.then(json);
		}

	}

	module.exports = EntityHandler;
