
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");

	class AlliancesTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let alliances_response = await client.Alliance.get_alliances();

			alliances_response.obj.forEach(alliance_id => BaseTask.create_task("Alliance", { alliance_id }, true));

			await this.update({
				expires: new Date(alliances_response.headers.expires).getTime()
			});

		}

	}

	module.exports = AlliancesTask;
