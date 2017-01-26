
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

			let war = WarStore.findOne({}, { sort: { id: -1 } }, true);
			let last_war_id = 1 + (await war.is_null() ? 0 : await war.get_id());

			times.push(Date.now() - start);

			console.log("wars last_war_id", last_war_id);

			let last_expires = 0;
			let more_pages = false;

			do {

				let { obj, headers } = await client.Wars.get_wars({ max_war_id: last_war_id + 2000});

				more_pages = obj.length == 2000;

				if (more_pages)
					last_war_id = obj[0];

				let ids = obj.reverse();
				ids.reverse().forEach(id => process.nextTick(() => WarStore.find_or_create(id)));

				last_expires = new Date(headers.expires).getTime();

			} while (more_pages);

			times.push(Date.now() - start);

			await this.update({
				expires: last_expires
			});

			times.push(Date.now() - start);

			console.log("wars", ...times);

		}

	}

	module.exports = WarsTask;
