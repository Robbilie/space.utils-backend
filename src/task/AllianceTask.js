
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");

	class AllianceTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let now = Date.now();
			let alliance_response = await client.Alliance.get_alliances_alliance_id(this.get_data());
			let corporations_response = await client.Alliance.get_alliances_alliance_id_corporations(this.get_data());
			console.log("alliance requests", Date.now() - now);

			await this.get_store().update(
				{ id: this.get_data().alliance_id },
				{
					$set: Object.assign({
						id: 						this.get_data().alliance_id,
						name: 						alliance_response.obj.alliance_name,
						ticker: 					alliance_response.obj.ticker,
						date_founded: 				new Date(alliance_response.obj.date_founded).getTime()
					}, alliance_response.obj.executor_corporation ? {
						executor_corporation_id: 	alliance_response.obj.executor_corporation
					} : {}),
					$unset: {
						[alliance_response.obj.executor_corporation ? "unset" : "executor_corporation_id"]: true
					}
				},
				{ upsert: true }
			);

			corporations_response.obj.forEach(corporation_id => BaseTask.create_task("Corporation", { corporation_id }, true));

			await this.update({
				expires: Math.max(new Date(alliance_response.headers.expires).getTime(), new Date(corporations_response.headers.expires).getTime())
			});

		}

	}

	module.exports = AllianceTask;
