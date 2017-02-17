
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");
	const { AllianceStore } = require("store/");

	class AlliancesTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			const { obj: alliances, headers } = await client.Alliance.get_alliances();

			const alliance_ids = await AllianceStore.from_cursor(c => c.find({ id: { $in: alliances } }).project({ id: 1 })).map(alliance => alliance.get_id());

			alliances
				.filter(alliance_id => !alliance_ids.includes(alliance_id))
				.forEach(alliance_id => AllianceStore.find_or_create(alliance_id, true));

			await this.update({ expires: new Date(headers.expires).getTime() });

		}

	}

	module.exports = AlliancesTask;
