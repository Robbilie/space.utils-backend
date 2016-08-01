
	"use strict";

	const XMLTask 					= require("task/XMLTask");
	const DBUtil 					= require("util/DBUtil");

	class CharacterInfoTask extends XMLTask {

		async start () {
try {
			let response;
			try {
				response = await this.getXML("EVE/CharacterInfo", this.dataToForm());
			} catch (e) {
				console.log("bigger error", e);
				await this.update({ state: 0 });
			}

			if(response && response.eveapi && response.eveapi.result) {

				const charStore = await DBUtil.getStore("Character");
				const corpStore = await DBUtil.getStore("Corporation");
				const alliStore = await DBUtil.getStore("Alliance");

				let characteritem = response.eveapi.result[0];

				let corporation = await corpStore.getOrCreate(characteritem.corporationID[0] - 0);

				// update corps' alliance if state differs or alli id
				if(
					(!!characteritem.allianceID != !!corporation.getAlliance()) || 
					(corporation.getAlliance() && corporation.getAlliance().getId() != characteritem.allianceID[0] - 0)
				)
					await corpStore.findAndModify(
						{ id: corporation.getId() }, 
						[], 
						Object.assign({}, characteritem.allianceID ? { $set: { alliance: (await alliStore.getById(characteritem.allianceID[0] - 0)).get_id() } } : { $unset: { alliance: "" } })
					);

				let character = {
					id: 			characteritem.characterID[0] - 0,
					name: 			characteritem.characterName[0],
					corporation: 	corporation.get_id()
				};

				await charStore.findAndModify({ id: character.id }, [], { $set: character }, { upsert: true });

			} else {
				console.log("invalid char", this.getData().characterID);
			}

			await this.delete();
		} catch(e) { console.log(e)}
		}

	};

	module.exports = CharacterInfoTask;