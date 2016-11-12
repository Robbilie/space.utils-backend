
	"use strict";

	const { InputUtil, LoadUtil } 	= require("util/");
	const { BaseHandler } 			= require("handler/");

	class EntityHandler extends BaseHandler {

		static async filter ({ swagger: { params }, body: { filter, options } }, { json }) {
			json({ items: await LoadUtil
				.store(`${this.name.slice(0, -7)}`)
				.from_cursor(c => c
					.find(InputUtil.sanitize(filter), InputUtil.limit(options))
				)
				.serialize() });
		}

		static async get_by_id ({ swagger: { params } }, { json }) {
			json(await LoadUtil
				.store(this.name.slice(0, -7))
				.find_or_create(params[this.name.slice(0, -7).toLowerCase() + "_id"].value)
				.serialize());
		}

	}

	module.exports = EntityHandler;
