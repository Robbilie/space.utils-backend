
	"use strict";

	const { BaseTask } 		= require("task/");
	const { ESIUtil } 		= require("util/");
	const { KillmailStore } = require("store/");

	class WarTask extends BaseTask {

		async start () {

			let start = Date.now();
			let times = [];

			let client = await ESIUtil.get_client();

			times.push(Date.now() - start);

			let [war_response, killmails_response] = await Promise.all([
				client.Wars.get_wars_war_id(this.get_data()),
				client.Wars.get_wars_war_id_killmails(this.get_data())
			]);

			times.push(Date.now() - start);

			let war = war_response.obj;
				if(war.declared)
					war.declared = new Date(war.declared).getTime();
				if(war.started)
					war.started = new Date(war.started).getTime();
				if(war.finished)
					war.finished = new Date(war.finished).getTime();

			let { finished, aggressor, defender } = war_response.obj;

			await this.get_store().update(
				{ id: this.get_data().war_id },
				{ $set: war_response.obj },
				{ upsert: true, w: 0 }
			);

			times.push(Date.now() - start);

			if (aggressor.corporation_id)
				BaseTask.create_task("Corporation", { corporation_id: aggressor.corporation_id }, true);
			if (aggressor.alliance_id)
				BaseTask.create_task("Alliance", { alliance_id: aggressor.alliance_id }, true);

			if (defender.corporation_id)
				BaseTask.create_task("Corporation", { corporation_id: defender.corporation_id }, true);
			if (defender.alliance_id)
				BaseTask.create_task("Alliance", { alliance_id: defender.alliance_id }, true);

			killmails_response.obj.forEach(({ killmail_id, killmail_hash }) => KillmailStore.find_or_create(killmail_id, killmail_hash));

			times.push(Date.now() - start);

			if (finished)
				await this.destroy();
			else
				await this.update({
					expires: new Date(war_response.headers.expires).getTime()
				});

			times.push(Date.now() - start);

			//console.log("character", ...times);

		}

	}

	module.exports = WarTask;
