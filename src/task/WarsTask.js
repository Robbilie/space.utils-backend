
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
			let last_expires = 0;
			let more_pages = false;

			do {

				let { obj, headers } = await client.Wars.get_wars({ max_war_id: last_war_id + 2000});

				let ids = obj.reverse();
				last_war_id = Math.max(last_war_id, ...ids);
				last_expires = new Date(headers.expires).getTime();
				ids.reverse().forEach(id => WarStore.find_or_create(id));
				more_pages = ids.length == 2000;

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
