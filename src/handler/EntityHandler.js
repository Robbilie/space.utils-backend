
	"use strict";

	const { InputUtil, LoadUtil } 	= require("util/");
	const { BaseHandler } 			= require("handler/");

	class EntityHandler extends BaseHandler {

		static post_filter ({ body: { filter, options } }, res) {
			console.log("get filter", this.name);
			LoadUtil
				.store(`${this.name.slice(0, -7)}`)
				.find(InputUtil.sanitize(filter), InputUtil.limit(options))
				.then(items => json.res({ items }));
		}

		static get_by_id ({ swagger: { params } }, res) {
			/*
			const model = LoadUtil.model(this.getName());
			const id = params[`${this.getName().toLowerCase()}_id`].value;

			model
				.aggregate({ id })
				.toArray()
				.run(_[0])
				.run(res.json);

			LoadUtil
				.model(this.getName())
				.aggregate({ id: params[`${this.getName().toLowerCase()}_id`].value })
				.toArray()
				.run(_[0])
				.run(res.json);
			*/
			LoadUtil
				.store(this.getName())
				.find_by_pk(params[this.getName().toLowerCase() + "_id"].value)
				.then(res.json);
		}

	}

	module.exports = EntityHandler;
