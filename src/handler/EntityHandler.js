
	"use strict";

	const { InputUtil, LoadUtil } 	= require("util/");
	const { BaseHandler } 			= require("handler/");

	class EntityHandler extends BaseHandler {

		static post_filter ({ body: { filter, options } }, res) {
			LoadUtil
				.store(`${this.name.slice(0, -7)}`)
				.find(InputUtil.sanitize(filter), InputUtil.limit(options))
				.then(items => res.json({ items }));
		}

		static async get_by_id ({ swagger: { params } }, res) {
			res.json(await LoadUtil
				.store(this.getName())
				.find_by_pk(params[this.getName().toLowerCase() + "_id"].value));
		}

	}

	module.exports = EntityHandler;
