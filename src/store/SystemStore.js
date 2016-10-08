
	"use strict";

	const { EntityStore } 		= require("store/");
	const { SystemJsonTask } 	= require("task/");

	class SystemStore extends EntityStore {

		async findOrCreate (id, {} = $(1, { id }, "Number")) {

			try {

				let system = await this.findById(id);

				if(await system.isNull()) {
					await SystemJsonTask.create({ systemID: id });
					system = await this.findById(id);
					if(await system.isNull()) {
						console.log("MISSING SYSTEM", id);
					}
				}

				return system;

			} catch (e) { console.log(e, new Error()); }

		}

	}

	module.exports = SystemStore;
