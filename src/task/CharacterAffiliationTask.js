
	"use strict";

	const { XMLTask } 				= require("task");
	const { DBUtil } 				= require("util");

	class CharacterAffiliationTask extends XMLTask {

		async start () {

			let response;
			try {
				response = await this.getXML("EVE/CharacterAffiliation", await this.dataToForm());
			} catch (e) {
				console.log("XMLERROR");
				return await this.update({ state: 0 });
			}

			if(response && response.eveapi && response.eveapi.result) {

				try {

					const charStore = await DBUtil.getStore("Character");
					const corpStore = await DBUtil.getStore("Corporation");
					const alliStore = await DBUtil.getStore("Alliance");

					let characteritems = response.eveapi.result[0].rowset[0].row;

					await Promise.all(characteritems.map(async characteritem => {

						/*
						 * Create basic char object
						 */
						let character = await charStore.findAndModify(
							{ id: characteritem.$.characterID - 0 },
							[],
							{
								$set: {
									id: 	characteritem.$.characterID - 0,
									name: 	characteritem.$.characterName
								}
							},
							{ upsert: true, new: true}
						);

						/*
						 * get or create corp and assign it to the char
						 */
						let corporation = await corpStore.findOrCreate(characteritem.$.corporationID - 0);
						if(corporation)
							await character.update({ $set: { corporation: await corporation.getId() } });

						/*
						 * Since this task should be perfectly new we can update the corps alli if it changed
						 */
						if(characteritem.$.allianceID - 0) {
							let alliance = await alliStore.findOrCreate(characteritem.$.allianceID - 0);
							await corporation.update({ $set: { alliance: await alliance.getId() } });
						} else {
							await corporation.update({ $unset: { alliance: "" } });
						}

					}));

				} catch (e) { console.log(e) }
				
				await this.update({ state: 2, timestamp: new Date(response.eveapi.cachedUntil[0] + "Z").getTime() });
				await this.update({ state: 0 });
				
			}
		}

	}

	module.exports = CharacterAffiliationTask;
