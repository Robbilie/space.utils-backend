
	"use strict";

	const { EntityStore } 			= require("store/");
	const { FactionTask } 			= require("task/");

	class FactionStore extends EntityStore {

		async findOrCreate (id, {} = $(1, { id }, "Number")) {
			try {

				let faction = await this.findById(id);

				if(await faction.isNull()) {
					await FactionTask.create({ ids: [id] });
					faction = await this.findById(id);
				}

				if(await faction.isNull()) {
					console.log("MISSING FACTION", id);
				}

				return faction;

			} catch (e) { console.log(e, new Error()); }
		}

	}

	module.exports = FactionStore;
