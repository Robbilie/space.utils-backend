
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

			let more_wars = true;
			let page = 1;

			while (more_wars) {
				// fetch data for 10 pages
				let wars = await Promise.all([...new Array(10).keys()].map(i => client.Wars.get_wars({ page: page + i })));
				// push expirations & create wars
				wars.forEach(({ obj, headers: { expires } }) => {
					obj.forEach(id => WarStore.find_or_create(id));
					if (obj.length < 2000)
						more_wars = false;
					expirations.push(new Date(expires).getTime());
				});
			}

			await this.update({
				expires: Math.max(...expirations)
			});

			times.push(Date.now() - start);

			//console.log("character", ...times);

		}

	}

	module.exports = WarsTask;
