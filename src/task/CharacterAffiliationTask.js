
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

				const charStore = await DBUtil.getStore("Character");
				const corpStore = await DBUtil.getStore("Corporation");
				const alliStore = await DBUtil.getStore("Alliance");

				let characteritems = response.eveapi.result[0].rowset[0].row;

				await Promise.all(characteritems.map(async characteritem => {

					let corporation = await corpStore.getOrCreate(characteritem.corporationID[0] - 0);

					if(characteritem.$.allianceID - 0 != 0) {

						// update corps' alliance if state differs or alli id
						if(
							(!!(characteritem.$.allianceID - 0) != !!corporation.getAlliance()) || 
							(corporation.getAlliance() && corporation.getAlliance().getId() != characteritem.$.allianceID - 0)
						)
							await corpStore.findAndModify(
								{ id: corporation.getId() }, 
								[], 
								Object.assign({}, characteritem.$.allianceID - 0 ? { $set: { alliance: (await alliStore.getById(characteritem.$.allianceID - 0)).get_id() } } : { $unset: { alliance: "" } })
							);

					}

					let character = {
						id: 			characteritem.$.characterID - 0,
						name: 			characteritem.$.characterName,
						corporation: 	corporation.get_id()
					};

					await charStore.findAndModify({ id: character.id }, [], { $set: character }, { upsert: true });

				}));

				await this.update({ state: 0, timestamp: new Date(response.eveapi.cachedUntil[0] + "Z").getTime() });
				
			}
		}

	};

	module.exports = CharacterAffiliationTask;