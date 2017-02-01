
	"use strict";

	const { Store } = require("store/");
	const { WarTask } = require("task/");

	class WarStore extends Store {

		static async find_or_create (war_id, {} = $(1, { war_id }, "Number")) {

			console.log("store war find");

			let war = await this.find_by_id(war_id);

			console.log("store war nullcheck");

			if(await war.is_null()) {
				console.log("store war isnull");
				await WarTask.create({ war_id });
				console.log("store war post");
				war = await this.find_by_id(war_id);
				console.log("store war found");
			}

			return war.get_future();

		}

		static find_by_id (id, {} = $(1, { id }, "Number")) {
			return this.findOne({ id });
		}

		static get_pk () {
			return "id";
		}

		static find_by_pk (...keys) {
			return this.from_promise(this.find_or_create(...keys));
		}

	}

	module.exports = WarStore;
