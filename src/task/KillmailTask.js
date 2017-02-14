
	"use strict";

	const { BaseTask } 				= require("task/");
	const { ESIUtil } 				= require("util/");
	const { CharacterStore, CorporationStore, AllianceStore} = require("store/");

	class KillmailTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let { obj: killmail } = await client.Killmails.get_killmails_killmail_id_killmail_hash(this.get_data());

			killmail = Object.assign(killmail, {
				id: 				this.get_data().killmail_id,
				hash: 				this.get_data().killmail_hash,
				attacker_count: 	killmail.attackers.length,
				time: 				new Date(killmail.killmail_time).getTime(),
				killmail_id: 		undefined,
				killmail_time: 		undefined
			});

			await this.get_store().insert(killmail);

			if (killmail.victim) {
				let { character_id, corporation_id, alliance_id } = killmail.victim;
				if (character_id)
					CharacterStore.find_or_create(character_id, true);
				if (corporation_id)
					CorporationStore.find_or_create(corporation_id, true);
				if (alliance_id)
					AllianceStore.find_or_create(alliance_id, true);
			}

			if (killmail.attackers)
				killmail.attackers.forEach(({ character_id, corporation_id, alliance_id }) => {
					if (character_id)
						CharacterStore.find_or_create(character_id, true);
					if (corporation_id)
						CorporationStore.find_or_create(corporation_id, true);
					if (alliance_id)
						AllianceStore.find_or_create(alliance_id, true);
				});

			await this.destroy();

		}

	}

	module.exports = KillmailTask;
