
	"use strict";

	const { XMLTask } 				= require("task/");
	const { DBUtil } 				= require("util/");

	class CharacterAffiliationTask extends XMLTask {

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
					const corpStore = await DBUtil.getStore("Corporation");
					const alliStore = await DBUtil.getStore("Alliance");

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

						/*
						 * get or create corp
						 */
						let corporation = await corpStore.findOrCreate(characterItem.$.corporationID - 0);

						/*
						 * Since this task should be perfectly new we can update the corps alli if it changed
						 */
						if(characterItem.$.allianceID - 0) {
							let alliance = await alliStore.findOrCreate(characterItem.$.allianceID - 0);
							await corporation.update({ $set: { alliance: await alliance.getId() } });
						} else {
							await corporation.update({ $unset: { alliance: "" } });
						}

					}));

				} catch (e) { console.log(e, new Error()); }
				
				await this.update({ state: 2, timestamp: new Date(response.eveapi.cachedUntil[0] + "Z").getTime() });
				await this.update({ state: 0 });
				
			}
		}

	}

	module.exports = CharacterAffiliationTask;
