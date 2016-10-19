
	"use strict";

	const { CRESTTask } 			= require("task/");
	const { DBUtil } 				= require("util/");

	class KillmailJsonTask extends CRESTTask {

		async start () {

			let response;
			try {
				response = await this.getCREST(`/killmails/${(await this.getData()).killID}/${(await this.getData()).hash}/`);
			} catch (e) {
				console.log("CRESTERROR", e, new Error());
				return await this.update({ state: 0 });
			}

			if(response && !response.exceptionType) {

				try {

					let killmailStore = await DBUtil.getStore("Killmail");

					let data = {
						killID: response.killID,
						hash: (await this.getData()).hash,
						killTime: (new Date(response.killTime + " UTC")).getTime(),
						attackerCount: response.attackerCount,
						solarSystemID: response.solarSystem.id,
						warID: response.war.id,
						victim: {
							damageTaken: response.victim.damageTaken
						}
					};

					if(response.victim.position)
						data.victim.position = reponse.victim.position;

					if(response.victim.character)
						data.victim.characterID = response.victim.character.id;

					if(response.victim.corporation)
						data.victim.corporationID = response.victim.corporation.id;

					if(response.victim.alliance)
						data.victim.allianceID = response.victim.alliance.id;

					if(response.victim.faction)
						data.victim.factionID = response.victim.faction.id;

					if(response.victim.shipType)
						data.victim.shipTypeID = response.victim.shipType.id;

					data.victim.items = response.victim.items.map(item => {
						let res = {
							singleton: 		item.singleton,
							flag: 			item.flag,
							itemTypeID: 	item.itemType.id
						};

						if(item.quantityDropped)
							res.quantityDropped = item.quantityDropped;

						if(item.quantityDestroyed)
							res.quantityDestroyed = item.quantityDestroyed;

						return res;
					});

					data.attackers = response.attackers.map(attacker => {
						let res = {
							damageDone: 		attacker.damageDone,
							finalBlow: 			attacker.finalBlow,
							securityStatus: 	attacker.securityStatus
						};

						if(attacker.character)
							res.characterID = attacker.character.id;

						if(attacker.corporation)
							res.corporationID = attacker.corporation.id;

						if(attacker.alliance)
							res.allianceID = attacker.alliance.id;

						if(attacker.faction)
							res.factionID = attacker.faction.id;

						if(attacker.shipType)
							res.shipTypeID = attacker.shipType.id;

						if(attacker.weaponType)
							res.weaponTypeID = attacker.weaponType.id;

						return res;
					});

					await killmailStore.update({ killID: response.killID }, { $set: data }, { upsert: true });

				} catch(e) { console.log(e, new Error()) }

			} else {
				console.log("invalid killmail", (await this.getData()).killID, (await this.getData()).hash, response);
				if(response && response.message != "Invalid killmail ID hash." && response.message != "The route /killmails/-1/Logibro Verified/ was not found")
					return await this.update({ state: 0 });
			}

			await this.destroy();
		}

	}

	module.exports = KillmailJsonTask;