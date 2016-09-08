
	"use strict";

	const { XMLTask } 		= require("task/");
	const { DBUtil } 		= require("util/");

	class CharacterInfoTask extends XMLTask {

		async start () {
			
			let response;
			try {
				response = await this.getXML("EVE/CharacterInfo", await this.dataToForm());
			} catch (e) {
				console.log("XMLERROR");
				return await this.update({ state: 0 });
			}


			if(response && response.eveapi && response.eveapi.result) {

				try {

					let char = response.eveapi.result[0];

					/*
					 * Create basic char entry so corp tasks can get the ceo
					 */
					let charStore = await DBUtil.getStore("Character");
					await charStore.update(
						{ id: char.characterID[0] - 0 },
						{
							$set: {
								id: 			char.characterID[0] - 0,
								name: 			char.characterName[0],
								corporation: 	char.corporationID[0] - 0
							}
						},
						{ upsert: true }
					);

					/*
					 * get or create corp and assign it to the char
					 */
					let corpStore = await DBUtil.getStore("Corporation");
					await corpStore.findOrCreate(char.corporationID[0] - 0);

					/*
					 * Since this task should be perfectly new we can update the corps alli if it changed
					 */
					/*
					if(char.allianceID ? char.allianceID[0] - 0 : 0) {
						let alliStore = await DBUtil.getStore("Alliance");
						let alliance = await alliStore.findOrCreate(char.allianceID[0] - 0);
						await corporation.update({ $set: { alliance: await alliance.getId() } });
					} else {
						await corporation.update({ $unset: { alliance: "" } });
					}
					*/

					// add to charaff
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
							$push: { "data.ids": char.characterID[0] - 0 }
						}
					);

				} catch(e) { console.log(e); }

			} else {
				console.log("invalid char", (await this.getData()).characterID, response);
			}

			await this.destroy();

		}

	}

	module.exports = CharacterInfoTask;