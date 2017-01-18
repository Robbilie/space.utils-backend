
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
			for (let i of new Array(100).keys()) {
				const local_storage = { c: i * 10, br: false };
				console.log("wars start from", i);

				let proms = [...new Array(10).keys()].map(x => client.Wars.get_wars({ page: local_storage.c + x + 1 }));

				console.log("wars created promises");
				let pages = [];
				for (let i of new Array(proms.length).keys())
					pages.push(await proms[i]);

				//let pages = await Promise.all([...new Array(10).keys()].map(x => client.Wars.get_wars({ page: local_storage.c + x + 1 })));

				console.log("wars loaded pages");
				pages.forEach(({ obj, headers: { expires } }) => {
					console.log("wars loop");
					obj.forEach(id => setImmediate(() => WarStore.find_or_create(id)));
					console.log("wars tasks");
					if (obj.length < 2000)
						local_storage.br = expires;
				});
				console.log("wars", "done with page", i + 10);
				if (local_storage.br) {
					await this.update({
						expires: new Date(local_storage.br).getTime()
					});
					break;
				}
			}
			*/

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

			let ids = await this.get_all_pages(client);
			console.log("wars", ids.length);
			ids.forEach(id => WarStore.find_or_create(id));

			await this.update({
				expires: Date.now() + (1000 * 60 * 60)
			});

			/*
			const expirations = [];

			const storage = {
				more_wars: true,
				page: 1
			};

			console.log("wars before while");

			while (storage.more_wars) {
				console.log("wars page", storage.page);
				// fetch data for 10 pages
				let wars = await Promise.all([...new Array(10).keys()].map(() => client.Wars.get_wars({ page: storage.page++ })));
				// push expirations & create wars
				wars.forEach(({ obj, headers: { expires } }) => {
					console.log("wars", obj.length);
					obj.forEach(id => WarStore.find_or_create(id));
					if (obj.length < 2000)
						storage.more_wars = false;
					expirations.push(new Date(expires).getTime());
				});
			}

			console.log("wars after while");

			await this.update({
				expires: Math.max(...expirations)
			});
			*/

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
				console.log("wars pages", skip + 1, "to", skip + size);
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
