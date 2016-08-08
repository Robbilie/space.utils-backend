
	"use strict";

	const XMLTask 					= require("task/XMLTask");
	const DBUtil 					= require("util/DBUtil");

	class CharacterInfoTask extends XMLTask {

		async start () {

			let d = Date.now();

			let tss = []

			
			let response;
			try {
				response = await this.getXML("EVE/CharacterInfo", this.dataToForm());
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


					let character = await charStore.findAndModify(
						{ id: char.characterID[0] - 0 },
						[],
						{
							$set: {
								id: 	char.characterID[0] - 0,
								name: 	char.characterName[0]
							}
						},
						{ upsert: true, new: true }
					);

					/*
					 * get or create corp and assign it to the char
					 */
					let corpStore = await DBUtil.getStore("Corporation");
					let corporation = await corpStore.getOrCreate(char.corporationID[0] - 0);
					if(corporation)
						character.update({ $set: { corporation: corporation.get_id() } });

					/*
					 * Since this task should be perfectly new we can update the corps alli if it changed
					 */
					if(char.allianceID ? char.allianceID[0] - 0 : 0) {
						let alliStore = await DBUtil.getStore("Alliance");
						let alliance = await alliStore.getOrCreate(char.allianceID[0] - 0);
						corporation.update({ $set: { alliance: alliance.get_id() } });
					} else {
						corporation.update({ $unset: { alliance: "" } });
					}

				} catch(e) { console.log(e) }

			} else {
				console.log("invalid char", this.getData().characterID);
			}

			await this.delete();

			console.log("CharacterInfo", ...tss.map(t => t - d));
		}

	};

	module.exports = CharacterInfoTask;