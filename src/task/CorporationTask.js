
	"use strict";

	const { BaseTask } 				= require("task/");

	class CorporationTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let corporation_response = await client.Corporation.get_corporations_corporation_id(this.get_data());
			let history_response = await client.Corporation.get_corporations_corporation_id_alliancehistory(this.get_data());

			let corporations = await this.get_collection();

			await corporations.update(
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

			// TODO: CEO Task and description field

			await this.update({
				state: 2,
				timestamp: new Date(history_response.expires).getTime()
			});

		}

	}

	module.exports = CorporationTask;
