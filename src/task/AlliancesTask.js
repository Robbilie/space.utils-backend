
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");
	const { AllianceStore } = require("store/");

	class AlliancesTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let { obj: alliances, headers } = await client.Alliance.get_alliances();

			alliances.forEach(alliance_id => AllianceStore.find_or_create(alliance_id, true));

			await this.update({ expires: new Date(headers.expires).getTime() });

		}

	}

	module.exports = AlliancesTask;
