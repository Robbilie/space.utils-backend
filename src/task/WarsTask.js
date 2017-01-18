
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

			let chunks = ids.chunk(2000);
			const process_chunk = chunk => new Promise(resolve => setImmediate(() => chunk.forEach(id => WarStore.find_or_create(id)) || resolve()));
			for (let i = 0; i < chunks.length; i++)
				await process_chunk(chunks[i]);

			await this.update({
				expires
			});

			times.push(Date.now() - start);

			console.log("wars", ...times);

		}

	}

	module.exports = WarsTask;
