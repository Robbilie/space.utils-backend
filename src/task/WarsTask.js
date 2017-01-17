
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


			for (let i of new Array(100).keys()) {
				const local_storage = { c: i * 10, br: false };
				console.log("wars start from", i);

				let proms = [...new Array(10).keys()].map(x => client.Wars.get_wars({ page: local_storage.c + x + 1 }));
				let pages = [];
				for (let prom in proms)
					pages.push(await proms[prom]);

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

	}

	module.exports = WarsTask;
