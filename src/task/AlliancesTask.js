
	"use strict";

	const { BaseTask, AllianceTask } = require("task/");
	const { ESIUtil } = require("util/");

	class AlliancesTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let alliances_response = await client.Alliance.get_alliances();

			await Promise.all(alliances_response.obj.map(alliance_id => AllianceTask.create({ alliance_id })));

			await this.update({
				timestamp: new Date(alliances_response.headers.expires).getTime()
			});

		}

	}

	module.exports = AlliancesTask;
