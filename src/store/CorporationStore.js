
	"use strict";

	const IdAndNameStore 			= require("store/IdAndNameStore");
	const CorporationSheetTask 		= require("task/CorporationSheetTask");

	class CorporationStore extends IdAndNameStore {

		aggregate (data, lookups = ["alliance"]) {
			console.log(data);
			return super.aggregate(data, lookups);
		}

		async getOrCreate (id, unverified, {} = $(1, {id}, "Number")) {
			let corporation = await this.getById(id);
			
			if(corporation)
				return corporation;
			
			if(!unverified)
				await CorporationSheetTask.create({ corporationID: id });
			
			corporation = await this.getById(id);

			return corporation;
		}

	}

	module.exports = CorporationStore;