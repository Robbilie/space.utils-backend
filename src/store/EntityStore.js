
	"use strict";

	const { Store } 		= require("store/");
	const { BaseTask } 		= require("task/");

	class EntityStore extends Store {

		static async find_or_create (id, faf, {} = $(1, { [`${this.get_name().toLowerCase()}_id`]: id }, "Number")) {

			let entity = await this.find_by_id(id);

			if(await entity.is_null()) {
				await BaseTask.create_task(this.get_name(), { [`${this.get_name().toLowerCase()}_id`]: id });
				if (!faf)
					entity = await this.find_by_id(id);
			}

			if(await entity.is_null())
				console.log("MISSING", this.get_name().toUpperCase(), id);

			return entity.get_future();

		}

		static get_pk () {
			return "id";
		}

		static find_by_pk (...keys) {
			return this.from_promise(this.find_or_create(...keys));
		}

		static find_by_id (id, {} = $(1, { id }, "Number")) {
			return this.findOne({ id });
		}

		static find_by_name (name, {} = $(1, { name }, "String")) {
			return this.findOne({ name });
		}

	}

	module.exports = EntityStore;
