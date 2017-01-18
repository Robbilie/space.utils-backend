
	"use strict";

	const { BaseTask } 		= require("task/");
	const { ESIUtil } 		= require("util/");
	const { SystemStore } 	= require("store/");

	class SystemsTask extends BaseTask {

		async start () {

			let start = Date.now();
			let times = [];

			let client = await ESIUtil.get_client();

			times.push(Date.now() - start);

			const { expires, ids } = await ESIUtil.get_all_pages(client.Universe.get_universe_systems);
			console.log("systems", ids.length);
			process.nextTick(() => ids.forEach(id => process.nextTick(() => SystemStore.find_or_create(id))));

			await this.update({
				expires
			});

			times.push(Date.now() - start);

			console.log("systems", ...times);

		}

	}

	module.exports = SystemsTask;
