
	"use strict";

	const { EntityStore } 			= require("store/");
	const { FactionTask } 			= require("task/");

	class FactionStore extends EntityStore {

		static async find_or_create (faction_id, {} = $(1, { faction_id }, "Number")) {
			try {

				let faction = await this.find_by_id(faction_id);

				if(await faction.is_null())
					await FactionTask.create({ ids: [faction_id] });

				faction = await this.find_by_id(faction_id);

				if(await faction.is_null())
					console.log("MISSING FACTION", faction_id);

				return faction.get_future();

			} catch (e) { console.log(e, new Error()); }
		}

	}

	module.exports = FactionStore;
