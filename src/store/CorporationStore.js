
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

			} catch (e) { console.log(e, new Error()); }

		}

	}

	CorporationStore.aggregations = [
		{
			$lookup: {
				from: 			"alliances",
				localField: 	"allianceID",
				foreignField: 	"id",
				as: 			"alliance"
			}
		},
		{
			$unwind: {
				path: 			"$alliance",
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$lookup: {
				from: 			"characters",
				localField: 	"ceoID",
				foreignField: 	"id",
				as: 			"ceo"
			}
		},
		{
			$unwind: {
				path: 			"$ceo",
				preserveNullAndEmptyArrays: true
			}
		}
	];

	module.exports = CorporationStore;
	