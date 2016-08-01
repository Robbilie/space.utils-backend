
	"use strict";

	const IdAndNameStore 			= require("store/IdAndNameStore");

	class AllianceStore extends IdAndNameStore {

		async getOrCreate (id, unverified, {} = $(1, {id}, "Number")) {
			try {
				let alliance = await this.getById(id);
				
				if(!alliance)
					console.log("alli", !!alliance, id);
				
				if(alliance)
					return alliance;

				if(!unverified)
					await AllianceJsonTask.create({ allianceID: id });

				alliance = await this.getById(id);

				return alliance;
			} catch (e) { console.log(e)}
		}
	}

	module.exports = AllianceStore;