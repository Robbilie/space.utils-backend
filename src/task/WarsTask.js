
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

				console.log("wars do start");

				let { obj, headers } = await client.Wars.get_wars({ max_war_id: last_war_id + 2000 });

				console.log("wars get page");

				expires = new Date(headers.expires).getTime();

				more_pages = (last_war_id + 2000 - 1) == obj[0];

				last_war_id = obj[0];

				/*let i = 0;
				for (let war_id of obj.reverse()) {
					console.log("wars start id", war_id);
					await WarStore.find_or_create(war_id);
					console.log("wars start id", war_id);
				}*/

				/*
				for (let chunk of obj.reverse().chunk(50)) {
					console.log("wars chunk start");
					await Promise.all(chunk.map(id => new Promise(resolve => setImmediate(() => WarStore.find_or_create(id).then(resolve)))));
					console.log("wars chunk mid");
					await this.update({ state: 1, modified: Date.now() });
					console.log("wars chunk end");
				}
				*/

				await Promise.all(obj.reverse().map(id => WarStore.find_or_create(id)));

				await this.update({ state: 1, modified: Date.now() });

				console.log("wars do end");

			} while (more_pages);

			console.log("wars after while");

			await this.update({
				expires
			});

		}

	}

	module.exports = WarsTask;
