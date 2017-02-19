
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");
	const { CharacterStore, CorporationStore, AllianceStore } = require("store/");

	class CorporationTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let [{ obj: corporation, headers }, old_corp] = await Promise.all([
				client.Corporation.get_corporations_corporation_id(this.get_data()),
				CorporationStore.find_by_id(this.get_data().corporation_id).get_future()
			]);

			let alliance_history = null;
			if (!old_corp || (old_corp && old_corp.alliance_id != corporation.alliance_id)) {
				let { obj } = await client.Corporation.get_corporations_corporation_id_alliancehistory(this.get_data());
				alliance_history = obj;
			}

			corporation = Object.assign(corporation, {
				id: 				this.get_data().corporation_id,
				name: 				corporation.name || corporation.corporation_name,
				corporation_name: 	undefined
			}, alliance_history ? {
				alliance_history:	alliance_history.map(entry => Object.assign(entry, { start_date: new Date(entry.start_date).getTime() }))
			} : {});

			let { ceo_id, alliance_id, member_count } = corporation;

			await this.get_store().update(
				{ id: corporation.id },
				{
					$set: corporation,
					$unset: { [alliance_id ? "unset" : "alliance_id"]: true }
				},
				{ upsert: true }
			);

			// get alliance
			if(alliance_id)
				AllianceStore.find_or_create(alliance_id, true);

			// get all alliances
			if (alliance_history)
				await Promise.all(alliance_history
					.filter(({ alliance }) => !!alliance)
					.map(({ alliance: { alliance_id } }) => AllianceStore.find_or_create(alliance_id, true)));

			// get ceo
			if(ceo_id == 1) {
				// dead corp
			} else if(ceo_id >= 3000000 && ceo_id < 4000000) {
				// is npc ceo
			} else if (ceo_id) {
				CharacterStore.find_or_create(ceo_id, true);
			} else {
				console.log("no ceo", this.get_data().corporation_id);
			}

			if(ceo_id == 1 || member_count == 0)
				await this.destroy();
			else
				await this.update({ expires: new Date(headers.expires).getTime() });

		}

	}

	module.exports = CorporationTask;
