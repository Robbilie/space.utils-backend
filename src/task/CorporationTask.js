
	"use strict";

	const { BaseTask, CharacterTask, AllianceTask } = require("task/");
	const { ESIUtil } = require("util/");

	class CorporationTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let corporation_response = await client.Corporation.get_corporations_corporation_id(this.get_data());
			let history_response = await client.Corporation.get_corporations_corporation_id_alliancehistory(this.get_data());

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
				{ upsert: true }
			);

			// get alliance
			if(corporation_response.obj.alliance_id)
				await AllianceTask.create({ alliance_id: corporation_response.obj.alliance_id });

			// get ceo
			await CharacterTask.create({ character_id: corporation_response.obj.ceo_id }, true);

			// get all alliances
			await Promise.all(history_response.obj.map(({ alliance: { alliance_id } }) => AllianceTask.create({ alliance_id })));

			await this.update({
				timestamp: Math.max(new Date(corporation_response.headers.expires).getTime(), new Date(history_response.headers.expires).getTime())
			});

		}

	}

	module.exports = CorporationTask;
