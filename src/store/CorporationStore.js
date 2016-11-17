
	"use strict";

	const { EntityStore } = require("store/");
	const { CorporationTask } = require("task/");

	class CorporationStore extends EntityStore {

		static async find_or_create (corporation_id, {} = $(1, { corporation_id }, "Number")) {

			try {
				
				let corporation = await this.find_by_id(corporation_id);
				
				if(await corporation.is_null())
					await CorporationTask.create({ corporation_id });

				corporation = await this.find_by_id(corporation_id);

				if(await corporation.is_null())
					console.log("MISSING CORP", corporation_id);

				return corporation.get_future();

			} catch (e) { console.log(e, new Error()); }

		}

	}

	CorporationStore.aggregations = [
		{
			$lookup: {
				from: 			"alliances",
				localField: 	"alliance_id",
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
				localField: 	"ceo_id",
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
	