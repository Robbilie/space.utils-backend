
	"use strict";

	const { EntityStore } 				= require("store/");
	const { CorporationSheetTask } 		= require("task/");

	class CorporationStore extends EntityStore {

		async findOrCreate (id, {} = $(1, { id }, "Number")) {

			try {
				
				let corporation = await this.findById(id);
				
				if(await corporation.isNull()) {
					await CorporationSheetTask.create({ corporationID: id });
					corporation = await this.findById(id);
				}

				return corporation;

			} catch (e) { console.log(e); }

		}

	}

	module.exports = CorporationStore;
	