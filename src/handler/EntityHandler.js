
	"use strict";

	const { InputUtil, LoadUtil } 	= require("util/");
	const { BaseHandler } 			= require("handler/");

	class EntityHandler extends BaseHandler {

		static async filter ({ body: { filter, options } }, { json }) {
			json({ items: await LoadUtil
				.store(`${this.name.slice(0, -7)}`)
				.from_cursor(c => c
					.find(InputUtil.sanitize(filter), InputUtil.limit(options))
				)
				.serialize() });
		}

		static async get_by_id ({ swagger: { params } }, { json }) {
			console.log(this.name);
			let store = LoadUtil.store(this.name.slice(0, -7));
			json(await store
				.find_by_pk(params[this.name.slice(0, -7).toLowerCase() + "_id"].value)
				.serialize());
		}

	}

	module.exports = EntityHandler;
