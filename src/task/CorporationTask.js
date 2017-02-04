
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");
	const { CharacterStore, AllianceStore } = require("store/");

	class CorporationTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let [corporation_response, history_response] = await Promise.all([
				client.Corporation.get_corporations_corporation_id(this.get_data()),
				client.Corporation.get_corporations_corporation_id_alliancehistory(this.get_data())
			]);

			let corporation = corporation_response.obj;
				corporation.id = this.get_data().corporation_id;
				corporation.name = corporation.name || corporation.corporation_name;
				delete corporation.corporation_name;
				corporation.alliance_history = history_response.obj;

			let { ceo_id, alliance_id, member_count } = corporation;

			await this.get_store().update(
				{ id: this.get_data().corporation_id },
				{
					$set: corporation,
					$unset: { [alliance_id ? "unset" : "alliance_id"]: true }
				},
				{ upsert: true, w: 0 }
			);

			// get alliance
			if(alliance_id)
				AllianceStore.find_or_create(alliance_id);

			// get all alliances
			history_response.obj
				.filter(({ alliance }) => !!alliance)
				.forEach(({ alliance: { alliance_id } }) => AllianceStore.find_or_create(alliance_id));

			// get ceo
			if(ceo_id == 1) {
				// dead corp
			} else if(ceo_id >= 3000000 && ceo_id < 4000000) {
				// is npc ceo
			} else if (ceo_id) {
				CharacterStore.find_or_create(ceo_id);
			} else {
				console.log("no ceo", this.get_data().corporation_id);
			}

			if(ceo_id == 1 || member_count == 0)
				await this.destroy();
			else
				await this.update({
					expires: new Date(corporation_response.headers.expires).getTime()
				});

		}

	}

	module.exports = CorporationTask;
