
	"use strict";

	const { BaseTask } 	= require("task/");
	const { ESIUtil } 	= require("util/");
	const { WarStore } 	= require("store/");

	class WarsTask extends BaseTask {

		async start () {

			let start = Date.now();
			let times = [];

			let client = await ESIUtil.get_client();

			times.push(Date.now() - start);

			const { expires, ids } = await ESIUtil.get_all_pages(client.Wars.get_wars);
			console.log("wars", ids.length);
			process.nextTick(() => ids.forEach(id => process.nextTick(() => WarStore.find_or_create(id))));

			await this.update({
				expires
			});

			times.push(Date.now() - start);

			console.log("wars", ...times);

		}

	}

	module.exports = WarsTask;
