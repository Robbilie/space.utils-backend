
	"use strict";

	const XMLTask 					= require("task/XMLTask");
	const DBUtil 					= require("util/DBUtil");

	class CharacterAffiliationTask extends XMLTask {

		async start () {

			let response;
			try {
				response = await this.getXML("EVE/CharacterAffiliation", this.dataToForm());
			} catch (e) {
				await this.update({ state: 0 });
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
						let corporation = await corpStore.getOrCreate(characteritem.$.corporationID - 0);
						await character.modify([], { $set: { corporation: corporation.get_id() } });

						/*
						 * Since this task should be perfectly new we can update the corps alli if it changed
						 */
						if((!!(characteritem.$.allianceID - 0) != !!corporation.getAlliance()) || (corporation.getAlliance() && corporation.getAlliance().getId() != characteritem.$.allianceID - 0)) {
							if(characteritem.$.allianceID - 0 != 0) {
								let alliance = await alliStore.getById(characteritem.$.allianceID - 0);
								await corporation.modify([], { $set: { alliance: alliance.get_id() } });
							} else {
								await corporation.modify([], { $unset: { alliance: "" } });
							}
						}

					}));

					await this.update({ state: 0, timestamp: new Date(response.eveapi.cachedUntil[0] + "Z").getTime() });

				} catch (e) { console.log(e) }
				
			}
		}

	};

	module.exports = CharacterAffiliationTask;