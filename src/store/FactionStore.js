
	"use strict";

	const { EntityStore } 			= require("store/");


	class FactionStore extends EntityStore {

		async findOrCreate (id, {} = $(1, { id }, "Number")) {
			try {

				let alliance = await this.findById(id);

				if(await alliance.isNull()) {
					console.log("MISSING FACTION", id);
				}

				return alliance;

			} catch (e) { console.log(e, new Error()); }
		}

	}

	module.exports = FactionStore;
