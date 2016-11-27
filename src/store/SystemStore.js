
	"use strict";

	const { EntityStore } 		= require("store/");
	const { SystemTask } 		= require("task/");

	class SystemStore extends EntityStore {

		static async find_or_create (system_id, {} = $(1, { system_id }, "Number")) {

			try {

				let system = await this.find_by_id(system_id);

				if(await system.is_null()) {
					await SystemTask.create({ system_id });
					system = await this.find_by_id(system_id);
				}

				if(await system.is_null())
					console.log("MISSING SYSTEM", system_id);

				return system.get_future();

			} catch (e) { console.log(e, new Error()); }

		}

	}

	module.exports = SystemStore;
