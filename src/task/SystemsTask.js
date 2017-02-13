
	"use strict";

	const { BaseTask } 	= require("task/");
	const { ESIUtil } 	= require("util/");
	const { SystemStore } = require("store/");

	class SystemsTask extends BaseTask {

		async start () {
			let client = await ESIUtil.get_client();
			let { obj } = await client.Universe.get_universe_systems();

			const ids = await SystemStore
				.from_cursor(c => c.find({ id: { $in: obj } }))
				.map(system => system.get_id());

			for (let system_id of obj.filter(id => !ids.includes(id))) {
				await SystemStore.find_or_create(system_id, true);
				await this.tick();
			}

			await this.update({ expires: Date.now() + (60 * 60 * 1000) });
		}

	}

	module.exports = SystemsTask;
