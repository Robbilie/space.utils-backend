
	"use strict";

	const { XMLTask } 		= require("task/");
	const { DBUtil } 		= require("util/");

	class FactionTask extends XMLTask {

		async start () {

			let response;
			try {
				response = await this.getXML("EVE/CharacterName", await this.dataToForm());
			} catch (e) {
				console.log("XMLERROR", e, new Error());
				return await this.update({ state: 0 });
			}


			if(response && response.eveapi && response.eveapi.result) {

				try {

					const factionStore = await DBUtil.getStore("Faction");

					let factionItems = response.eveapi.result[0].rowset[0].row;

					await Promise.all(factionItems.map(async factionItem => {

						/*
						 * Create basic faction object
						 */
						await factionStore.update(
							{ id: factionItem.$.characterID - 0 },
							{
								$set: {
									id: 			factionItem.$.characterID - 0,
									name: 			factionItem.$.name,
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

	module.exports = FactionTask;
