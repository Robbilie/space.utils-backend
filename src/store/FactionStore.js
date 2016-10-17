
	"use strict";

	const { EntityStore } 			= require("store/");

	class FactionStore extends EntityStore {

		async findOrCreate (id, {} = $(1, { id }, "Number")) {
			try {

				console.log("MISSING FACTION", id);

				return new Faction(Promise.resolve());

			} catch (e) { console.log(e, new Error()); }
		}

	}

	module.exports = FactionStore;
