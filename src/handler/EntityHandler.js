
	"use strict";

	const { InputUtil, LoadUtil } 	= require("util/");
	const { BaseHandler } 			= require("handler/");

	class EntityHandler extends BaseHandler {

		static async filter ({ body: { filter, options } }, res) {
			res.json({ items: await LoadUtil
				.store(`${this.name.slice(0, -7)}`)
				.from_cursor(c => c
					.find(InputUtil.sanitize(filter), InputUtil.limit(options))
				)
				.serialize() });
		}

		static async get_by_id ({ swagger: { params } }, res) {
			console.log(this.name.slice(0, -7));
			let store = LoadUtil.store(this.name.slice(0, -7));
			console.log(store);
			res.json(await store
				.find_by_pk(params[this.name.slice(0, -7).toLowerCase() + "_id"].value)
				.serialize());
		}

	}

	module.exports = EntityHandler;
