
	"use strict";

	const { BaseTask } 	= require("task/");
	const { ESIUtil } 	= require("util/");
	const { SystemStore } = require("store/");

	class SystemsTask extends BaseTask {

		async start () {
			let client = await ESIUtil.get_client();
			const { obj } = await client.Universe.get_universe_systems();

			const ids = await SystemStore
				.from_cursor(c => c.find({ id: { $in: obj } }).project({ id: 1 }))
				.map(system => system.get_id());

			obj
				.filter(id => !ids.includes(id))
				.forEach(system_id => this.enqueue_reference("System", system_id));

			await this.update({ expires: Date.now() + (60 * 60 * 1000) });
		}

	}

	module.exports = SystemsTask;
