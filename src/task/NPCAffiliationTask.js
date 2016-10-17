	
	"use strict";
	
	const { XMLTask } 				= require("task/");
	const { DBUtil } 				= require("util/");
	
	class NPCAffiliationTask extends XMLTask {
	
		async start () {
	
			let response;
			try {
				response = await this.getXML("EVE/CharacterAffiliation", await this.dataToForm());
			} catch (e) {
				console.log("XMLERROR", e, new Error());
				return await this.update({ state: 0 });
			}
	
			if(response && response.eveapi && response.eveapi.result) {
	
				try {
	
					const charStore = await DBUtil.getStore("Character");
	
					let characterItems = response.eveapi.result[0].rowset[0].row;
	
					await Promise.all(characterItems.map(async characterItem => {
	
						/*
						 * Create basic char object
						 */
						await charStore.update(
							{ id: characterItem.$.characterID - 0 },
							{
								$set: {
									id: 			characterItem.$.characterID - 0,
									name: 			characterItem.$.characterName,
									corporationID: 	characterItem.$.corporationID - 0,
									updated: 		new Date(response.eveapi.currentTime[0] + "Z").getTime()
								}
							},
							{ upsert: true }
						);
	
					}));
	
				} catch (e) { console.log(e, new Error()); }

				await this.destroy();
	
			}
		}
	
	}
	
	module.exports = NPCAffiliationTask;
