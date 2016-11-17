
	"use strict";

	const { BaseTask } 				= require("task/");
	const { ESIUtil } 				= require("util/");

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

			// TODO: CEO Task and description field and alliance history?

			await this.update({
				state: 2,
				timestamp: Math.max(new Date(corporation_response.headers.expires).getTime(), new Date(history_response.headers.expires).getTime())
			});

		}

	}

	module.exports = CorporationTask;
