
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

			/*
			for (let page of new Array(1000).keys()) {
				if (!page) continue;
				let time = process.hrtime();
				let { obj, headers: { expires } } = await client.Wars.get_wars({ page });
				console.log("wars page", page, "took", ...process.hrtime(time));
				obj.forEach(id => WarStore.find_or_create(id));
				console.log("wars", obj.length);
				if (obj.length < 2000) {
					await this.update({
						expires: new Date(expires).getTime()
					});
					break;
				}
			}
			*/

			//let ids = await this.get_all_pages(client);
			let ids = await ESIUtil.get_all_pages(client.Wars.get_wars);
			console.log("wars", ids.length);
			ids.forEach(id => WarStore.find_or_create(id));

			await this.update({
				expires: Date.now() + (1000 * 60 * 60)
			});

			times.push(Date.now() - start);

			console.log("wars", ...times);

		}

		get_all_pages (client) {
			return this.get_chunk_and_continue(client, 0, 10);
		}

		get_chunk_and_continue (client, skip, size) {
			let promises = [];
			for (let i = skip * size + 1; i <= (skip + 1) * size; i++)
				promises.push(this.get_delayed_page(client, i));
			return Promise.all(promises).then(pages => {
				console.log("wars pages", skip * size + 1, "to", (skip + 1) * size);
				if (pages.map(({ obj }) => obj.length).reduce((p, c) => p + c, 0) % 2000 != 0)
					return [].concat(...pages.map(({ obj }) => obj));
				else
					return this.get_chunk_and_continue(client, skip + 1, size)
						.then(arr => [].concat(...pages.map(({ obj }) => obj)).concat(arr));
			})
		}

		get_delayed_page (client, page) {
			return new Promise((resolve, reject) => process.nextTick(() => client.Wars.get_wars({ page }).then(resolve).catch(reject)));
		}

	}

	module.exports = WarsTask;
