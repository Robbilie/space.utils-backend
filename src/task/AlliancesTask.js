
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");
	const { AllianceStore } = require("store/");

	class AlliancesTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			const { body: alliances, headers } = await client.apis.Alliance.get_alliances();

			const alliance_ids = await AllianceStore.from_cursor(c => c.find({ id: { $in: alliances } }).project({ id: 1 })).map(alliance => alliance.get_id());

			alliances
				.filter(alliance_id => !alliance_ids.includes(alliance_id))
				.forEach(alliance_id => this.enqueue_reference("Alliance", alliance_id));

			await this.update({ expires: new Date(headers.expires).getTime() });

		}

	}

	module.exports = AlliancesTask;
