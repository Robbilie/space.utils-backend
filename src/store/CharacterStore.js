
	"use strict";

	const IdAndNameStore 			= require("store/IdAndNameStore");
	const CharacterInfoTask 		= require("task/CharacterInfoTask");
	const DBUtil 					= require("util/DBUtil");
	const Corporation 				= require("model/Corporation");
	const Alliance 					= require("model/Alliance");

	class CharacterStore extends IdAndNameStore {

		aggregate (data, lookups = ["corporation", "corporation.alliance"]) {
			return super.aggregate(
				data, 
				lookups,
				doc => Object.assign(
					doc, 
					doc.corporation && doc.corporation.alliance ? { corporation: Object.assign(doc.corporation, { alliance: new Alliance(doc.corporation.alliance) }) } : {}, 
					doc.corporation ? { corporation: new Corporation(doc.corporation) } : {}
				)
			);
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
							{ "info.name": "CharacterAffiliation", $where: "this.data.ids.length < 250" }, 
							[], 
							{ 
								$setOnInsert: {
									info: {
										type: "XML",
										name: "CharacterAffiliation",
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