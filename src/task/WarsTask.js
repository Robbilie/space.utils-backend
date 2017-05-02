
	"use strict";

	const { BaseTask } 	= require("task/");
	const { ESIUtil } 	= require("util/");
	const { WarStore } 	= require("store/");

	class WarsTask extends BaseTask {

		async start () {
			let war = WarStore.findOne({}, { sort: { id: -1 } }, true);
			let last_war_id = 1 + (this.get_info().debug || await war.is_null() ? 0 : await war.get_id());
			await this.get_pages(await ESIUtil.get_client(), last_war_id + 2000);
			await this.update({ expires: Date.now() + (60 * 60 * 1000) });
		}

		async get_pages (client, max_war_id) {
			const s = { length: 0, max_war_id: undefined };

			{
				let { body: wars } = await client.apis.Wars.get_wars({ max_war_id });
				s.length = wars.length;
				s.max_war_id = wars[0];
				wars
					.reverse()
					.forEach(war_id => this.enqueue_reference("War", war_id));
				await this.tick();
			}

			if (s.length === 2000 && s.max_war_id === max_war_id - 1)
				return await this.get_pages(client, max_war_id + 2000);
			else
				return true;
		}

	}

	module.exports = WarsTask;
