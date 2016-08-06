
	"use strict";

	const IdAndNameStore 			= require("store/IdAndNameStore");
	const CharacterInfoTask 		= require("task/CharacterInfoTask");
	const CharacterAffiliationTask 	= require("task/CharacterAffiliationTask");
	const DBUtil 					= require("util/DBUtil");

	class CharacterStore extends IdAndNameStore {

		aggregate (data, lookups = ["corporation", "corporation.alliance"]) {
			return super.aggregate(data, lookups);
		}

		async getOrCreate (id, unverified, {} = $(1, {id}, "Number")) {
			try {

				let character = await this.getById(id);
				
				if(!character) {
					if(!unverified)
						await CharacterInfoTask.create({ characterID: id });
					character = await this.getById(id);
					if(!character) {
						console.log("MISSING CHAR", id);
					} else {
						let taskStore 	= await DBUtil.getStore("Task");
						await taskStore.findAndModify(
							{ "info.name": "CharacterAffiliationTask", $where: "this.data.ids.length < 250" }, 
							[], 
							{ 
								$setOnInsert: {
									info: {
										type: "XML",
										name: "CharacterAffiliationTask",
										state: 0,
										timestamp: 0
									}
								},
								$push: { "data.ids": id }
							}
						);
						
					}
				}

				return character;

			} catch (e) { console.log(e)}
		}

	}

	module.exports = CharacterStore;