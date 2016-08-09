
	"use strict";

	const IdAndNameStore 			= require("store/IdAndNameStore");
	const CorporationSheetTask 		= require("task/CorporationSheetTask");
	const Character 				= require("model/Character");
	const Alliance 					= require("model/Alliance");

	class CorporationStore extends IdAndNameStore {

		aggregate (data, lookups = ["alliance", { from: "characters", localField: "ceo" }]) {
			return super.aggregate(
				data, 
				lookups,
				doc => Object.assign(
					doc, 
					doc.ceo ? { ceo: new Character(doc.ceo) } : {}, 
					doc.alliance ? { alliance: new Alliance(doc.alliance) } : {}
				)
			);
		}

		async getOrCreate (id, unverified, {} = $(1, {id}, "Number")) {
			try {
				
				let corporation = await this.getById(id);
				
				if(!corporation) {
					if(!unverified)
						await CorporationSheetTask.create({ corporationID: id });
					corporation = await this.getById(id);
				}

				return corporation;

			} catch (e) { console.log(e)}
		}

	}

	module.exports = CorporationStore;