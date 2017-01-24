
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
			let last_war_id;
			if(await war.is_null())
				last_war_id = 1;
			else
				last_war_id = await war.get_id();

			times.push(Date.now() - start);

			let max_war_id = undefined;
			let global_expires = 0;

			do {

				let { obj, headers } = await client.Wars.get_wars({ max_war_id });
				max_war_id = Math.min(max_war_id, ...obj);
				obj.forEach(id => WarStore.find_or_create(id));
				global_expires = Math.max(global_expires, new Date(headers.expires).getTime());

				console.log("wars new max_war_id", max_war_id);

			} while (last_war_id < max_war_id);

			times.push(Date.now() - start);

			await this.update({
				expires: global_expires
			});

			times.push(Date.now() - start);

			console.log("wars", ...times);

		}

	}

	module.exports = WarsTask;
