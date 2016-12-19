
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");

	class CorporationTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let now = Date.now();
			let corporation_response = await client.Corporation.get_corporations_corporation_id(this.get_data());
			let history_response = await client.Corporation.get_corporations_corporation_id_alliancehistory(this.get_data());
			console.log("corporation requests", Date.now() - now);

			await this.get_store().update(
				{ id: this.get_data().corporation_id },
				{
					$set: Object.assign({
						id: 				this.get_data().corporation_id,
						name: 				corporation_response.obj.corporation_name,
						ticker: 			corporation_response.obj.ticker,
						member_count: 		corporation_response.obj.member_count,
						ceo_id: 			corporation_response.obj.ceo_id,
						alliance_history: 	history_response.obj
					}, corporation_response.obj.alliance_id ? {
						alliance_id: corporation_response.obj.alliance_id
					} : {}),
					$unset: {
						[corporation_response.obj.alliance_id ? "unset" : "alliance_id"]: true
					}
				},
				{ upsert: true, w: 0 }
			);

			// get alliance
			if(corporation_response.obj.alliance_id)
				BaseTask.create_task("Alliance", { alliance_id: corporation_response.obj.alliance_id }, true);

			// get ceo
			if(corporation_response.obj.ceo_id == 1) {
				// dead corp
			} else if(corporation_response.obj.ceo_id >= 3000000 && corporation_response.obj.ceo_id < 4000000) {
				// is npc ceo
			} else {
				BaseTask.create_task("Character", { character_id: corporation_response.obj.ceo_id }, true);
			}

			// get all alliances
			history_response.obj.filter(alliance => !!alliance.alliance).forEach(({ alliance: { alliance_id } }) => BaseTask.create_task("Alliance", { alliance_id }, true));

			await this.update({
				expires: Math.max(new Date(corporation_response.headers.expires).getTime(), new Date(history_response.headers.expires).getTime())
			});

		}

	}

	module.exports = CorporationTask;
