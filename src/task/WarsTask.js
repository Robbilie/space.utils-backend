
	"use strict";

	const { BaseTask } 	= require("task/");
	const { ESIUtil } 	= require("util/");
	const { WarStore } 	= require("store/");

	class WarsTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let war = WarStore.findOne({}, { sort: { id: -1 } }, true);
			let last_war_id = 1 + (this.get_info().debug || await war.is_null() ? 0 : await war.get_id());

			console.log("wars last_war_id", last_war_id);

			let expires = 0;
			let more_pages = false;

			do {

				let { obj, headers } = await client.Wars.get_wars({ max_war_id: last_war_id + 2000});

				expires = new Date(headers.expires).getTime();

				more_pages = obj.length == 2000;

				if (obj.length)
					last_war_id = obj[0];

				await Promise.all(obj.reverse().map(id => WarStore.find_or_create(id)));

				await this.update({ state: 1, modified: Date.now() });

			} while (more_pages);

			await this.update({
				expires
			});

		}

	}

	module.exports = WarsTask;
