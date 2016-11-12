
	"use strict";

	const { BaseTask, CorporationTask } = require("task/");
	const { ESIUtil } = require("util/");

	class AllianceTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let alliance_response = await client.Alliance.get_alliances_alliance_id(this.get_data());

			let alliances = await this.get_collection();

			await alliances.update(
				{ id: this.get_data().alliance_id },
				{
					$set: {
						id: 						this.get_data().alliance_id,
						name: 						alliance_response.obj.alliance_name,
						ticker: 					alliance_response.obj.ticker,
						date_founded: 				new Date(alliance_response.obj.date_founded).getTime(),
						executor_corporation_id: 	alliance_response.obj.executor_corp
					}
				},
				{ upsert: true }
			);

			let corporations_response = await client.Alliance.get_alliances_alliance_id_corporations(this.get_data());

			await Promise.all(corporations_response.response.obj.map(corporation_id => BaseTask.create_task("Corporation", { corporation_id })));

			await this.update({
				state: 2,
				timestamp: Math.max(new Date(alliance_response.expires).getTime(), new Date(corporations_response.expires).getTime())
			});

		}

	}

	module.exports = AllianceTask;