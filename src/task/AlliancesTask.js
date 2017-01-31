
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");
	const { AllianceStore } = require("store/");

	class AlliancesTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let alliances_response = await client.Alliance.get_alliances();

			alliances_response.obj.forEach(alliance_id => AllianceStore.find_or_create(alliance_id));

			await this.update({
				expires: new Date(alliances_response.headers.expires).getTime()
			});

		}

	}

	module.exports = AlliancesTask;
