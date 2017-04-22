
	"use strict";

	const { InputUtil, LoadUtil } 	= require("util/");
	const { BaseHandler } 			= require("handler/");

	class EntityHandler extends BaseHandler {

		static async filter ({ body: { filter, options } }, res) {
			console.log("get filter", this.name);
			res.json({ items: await LoadUtil
				.store(`${this.name.slice(0, -7)}`)
				.from_cursor(c => c
					.find(InputUtil.sanitize(filter), InputUtil.limit(options))
				)
				.serialize() });
		}

		static async get_by_id ({ swagger: { params } }, res) {
			let store = LoadUtil.store(this.name.slice(0, -7));
			res.json(await store
				.find_by_pk(params[this.name.slice(0, -7).toLowerCase() + "_id"].value)
				.serialize());
		}

	}

	module.exports = EntityHandler;
