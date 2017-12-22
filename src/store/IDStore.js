
	"use strict";

	const { Store } 		= require("store/");
	const { BaseTask } 		= require("task/");

	class IDStore extends Store {

		static async find_or_create (id, faf = false, {} = $(1, { [`${this.getName().toLowerCase()}_id`]: id }, "Number")) {

			let entity = this.find_by_id(id, faf === false ? {} : { fields: { id: true } }, faf);

			if (await entity.isNull() === true)
				await BaseTask.create_task(this.getName(), { [`${this.getName().toLowerCase()}_id`]: id }, faf);

			if (faf === true)
				return null;

			if (await entity.isNull() === true)
				entity = this.find_by_id(id/*, faf === false ? {} : { fields: { id: true } }, faf*/);

			if (await entity.isNull() === true)
				console.log("MISSING", this.getName().toUpperCase(), id);

			return entity.getFuture();

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
