
	"use strict";

	const { BaseTask } 	= require("task/");
	const { DB, ESI } = require("util/");

	class WarsTask extends BaseTask {

		async start () {
			let war = await DB.collection("wars").findOne({}, { sort: { id: -1 } });
			let last_war_id = 1 + (this.get_info().debug || war === null ? 0 : war.id);
			await this.get_pages(last_war_id + 2000);
			await this.update({ expires: Date.now() + (60 * 60 * 1000) });
		}

		async get_pages (max_war_id) {
			const s = { length: 0, max_war_id: undefined };

			{
				let { body: wars } = await ESI.Wars.get_wars({ max_war_id });
				s.length = wars.length;
				s.max_war_id = wars[0];
				wars
					.reverse()
					.forEach(war_id => this.enqueue_reference("War", war_id));
				await this.tick();
			}

			if (s.length === 2000 && s.max_war_id === max_war_id - 1)
				return await this.get_pages(max_war_id + 2000);
			else
				return true;
		}

	}

	module.exports = WarsTask;
