
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

			times.push(Date.now() - start);

			console.log("wars", ...times);

		}

	}

	module.exports = WarsTask;
