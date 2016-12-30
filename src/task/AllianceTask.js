
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");

	class AllianceTask extends BaseTask {

		async start () {

			let start = Date.now();
			let times = [];

			let client = await ESIUtil.get_client();

			times.push(Date.now() - start);

			let [alliance_response, corporations_response] = await Promise.all([
				client.Alliance.get_alliances_alliance_id(this.get_data()),
				client.Alliance.get_alliances_alliance_id_corporations(this.get_data())
			]);

			times.push(Date.now() - start);

			let { alliance_name, name = alliance_name, ticker, date_founded, executor_corp, executor_corporation_id = executor_corp } = alliance_response;

			await this.get_store().update(
				{ id: this.get_data().alliance_id },
				{
					$set: {
						name,
						ticker,
						executor_corporation_id,
						date_founded: new Date(alliance_response.obj.date_founded).getTime()
					},
					$unset: {
						[alliance_response.obj.executor_corporation ? "unset" : "executor_corporation_id"]: true
					}
				},
				{ upsert: true, w }
			);

			times.push(Date.now() - start);

			corporations_response.obj.forEach(corporation_id => BaseTask.create_task("Corporation", { corporation_id }, true));

			times.push(Date.now() - start);

			await this.update({
				expires: Math.max(new Date(alliance_response.headers.expires).getTime(), new Date(corporations_response.headers.expires).getTime())
			});

			times.push(Date.now() - start);

			//console.log("alliance", ...times);

		}

	}

	module.exports = AllianceTask;
