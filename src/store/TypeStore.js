
	"use strict";

	const { EntityStore } = require("store/");
	const { TypeTask } = require("task/");

	class TypeStore extends EntityStore {

		static async find_or_create (type_id, {} = $(1, { type_id }, "Number")) {

			try {

				let type = await this.find_by_id(type_id);

				if(await type.is_null()) {
					await TypeTask.create({ type_id });
					type = await this.find_by_id(type_id);
				}

				if(await type.is_null())
					console.log("MISSING TYPE", type_id);

				return type.get_future();

			} catch (e) { console.log(e, new Error()); }

		}

	}

	module.exports = TypeStore;
