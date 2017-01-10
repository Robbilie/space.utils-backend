
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

			let { obj, headers } = client.Wars.get_wars_war_id(this.get_data());

			times.push(Date.now() - start);

			let war = obj;
				if(war.declared)
					war.declared = new Date(war.declared).getTime();
				if(war.started)
					war.started = new Date(war.started).getTime();
				if(war.finished)
					war.finished = new Date(war.finished).getTime();

			let { finished, aggressor, defender } = obj;

			await this.get_store().update(
				{ id: this.get_data().war_id },
				{ $set: obj },
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

			times.push(Date.now() - start);

			const storage = {
				more_killmails: true,
				page: 1
			};

			while (storage.more_killmails) {
				let { obj } = await client.Wars.get_wars_war_id_killmails({ war_id: this.get_data().war_id, page: page++ });
				obj.forEach(({ killmail_id, killmail_hash }) => KillmailStore.find_or_create(killmail_id, killmail_hash));
				if (obj.length < 2000)
					storage.more_killmails = false;
			}

			times.push(Date.now() - start);

			if (finished)
				await this.destroy();
			else
				await this.update({
					expires: new Date(headers.expires).getTime()
				});

			times.push(Date.now() - start);

			//console.log("character", ...times);

		}

	}

	module.exports = WarTask;
