
	"use strict";

	const { Store } 		= require("store/");
	const { BaseTask } 		= require("task/");

	class IDStore extends Store {

		static async find_or_create (id, faf, {} = $(1, { [`${this.get_name().toLowerCase()}_id`]: id }, "Number")) {

			let entity = this.find_by_id(id, {}, faf);

			if (await entity.is_null() === true)
				await BaseTask.create_task(this.get_name(), { [`${this.get_name().toLowerCase()}_id`]: id }, faf);

			if (faf === true)
				return null;

			if (await entity.is_null() === true)
				entity = this.find_by_id(id);

			if (await entity.is_null() === true)
				console.log("MISSING", this.get_name().toUpperCase(), id);

			return entity.get_future();

		}

		static get_pk () {
			return "id";
		}

		static find_by_pk (...keys) {
			return this.from_promise(this.find_or_create(...keys));
		}

		static find_by_id (id, options = {}, bare, {} = $(1, { id }, "Number")) {
			return this.findOne({ id }, options, bare);
		}

	}

	module.exports = IDStore;
