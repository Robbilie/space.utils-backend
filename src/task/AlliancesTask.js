
	"use strict";

	const { BaseTask } = require("task/");
	const { ESI } = require("util/");
	const { AllianceStore } = require("store/");

	class AlliancesTask extends BaseTask {

		async start () {

			const { body: alliances, headers } = await ESI.Alliance.get_alliances();

			const alliance_ids = await AllianceStore
				.from_cursor(c => c
					.find({ id: { $in: alliances } })
					.project({ id: 1 }))
				.map(alliance => alliance.get_id());
			/*
			const alliance_ids = await DB
				.collection("alliances")
				.find({ id: { $in: alliances } })
				.project({ id: 1 })
				.map(({ id }) => id)
				.toArray();
			const alliance_ids = await AllianceStore
				.from_cursor(await DB
					.collection("alliances")
					.find({ id: { $in: alliances } })
					.project({ id: 1 })
				)
				.map(alliance => alliance.get_id());
			const alliance_executor_ceos = await DB
				.collection("alliances")
				.find({ id: { $in: alliances } })
				.project({ id: 1 })
				.toArray()
				.run(AllianceList.create)
				.map(_.get_executor_corporation())
				.map(_.get_ceo());
			*/

			alliances
				.filter(alliance_id => !alliance_ids.includes(alliance_id))
				.forEach(alliance_id => this.enqueue_reference("Alliance", alliance_id));

			await this.update({ expires: new Date(headers.expires).getTime() });

		}

	}

	module.exports = AlliancesTask;
