
	"use strict";

	const { InputUtil, LoadUtil } 	= require("util/");
	const { BaseHandler } 			= require("handler/");

	class EntityHandler extends BaseHandler {

		static async post_filter ({ body: { filter, options } }, res) {
			console.log("get filter", this.name);
			res.json({ items: await LoadUtil
				.store(`${this.name.slice(0, -7)}`)
				.find(InputUtil.sanitize(filter), InputUtil.limit(options))
				.get_raw() });
		}

		static async get_by_id ({ swagger: { params } }, res) {
			let store = LoadUtil.store(this.name.slice(0, -7));
			res.json(await store
				.find_by_pk(params[this.name.slice(0, -7).toLowerCase() + "_id"].value, {}, false)
				.serialize());
		}

	}

	module.exports = EntityHandler;
