
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

			let last_war_id = await WarStore.findOne({}, { sort: { id: -1 } }, true).get_id() || 1;

			times.push(Date.now() - start);

			let max_war_id = undefined;
			let global_expires = 0;

			do {

				let { obj, headers: { expires } } = await client.Wars.get_wars({ max_war_id });
				max_war_id = Math.min(max_war_id, ...obj);
				obj.forEach(id => WarStore.find_or_create(id));
				global_expires = Math.max(global_expires, expires);

				console.log("wars new max_war_id", max_war_id);

			} while (last_war_id < max_war_id);

			times.push(Date.now() - start);

			await this.update({
				expires: global_expires
			});

			times.push(Date.now() - start);

			console.log("wars", ...times);


			/*
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
			*/

		}

	}

	module.exports = WarsTask;
