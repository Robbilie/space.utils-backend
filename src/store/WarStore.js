
	"use strict";

	const { Store } = require("store/");
	const { WarTask } = require("task/");

	class WarStore extends Store {

		static async find_or_create (war_id, faf, {} = $(1, { war_id }, "Number")) {

			let war = this.find_by_id(war_id);

			if(await war.is_null()) {
				await WarTask.create({ war_id }, faf);
				if (faf) return null;
				war = this.find_by_id(war_id);
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
