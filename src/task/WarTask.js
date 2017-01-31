
	"use strict";

	const { BaseTask } 		= require("task/");
	const { ESIUtil } 		= require("util/");
	const { KillmailStore } = require("store/");

	class WarTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let { obj, headers } = await client.Wars.get_wars_war_id(this.get_data());

			let war = obj;
				if(war.declared)
					war.declared = new Date(war.declared).getTime();
				if(war.started)
					war.started = new Date(war.started).getTime();
				if(war.finished)
					war.finished = new Date(war.finished).getTime();
				if(war.retracted)
					war.retracted = new Date(war.retracted).getTime();

			let { finished, aggressor, defender, allies = [] } = obj;

			await this.get_store().update(
				{ id: this.get_data().war_id },
				{ $set: obj },
				{ upsert: true, w: 0 }
			);

			if (aggressor.corporation_id)
				BaseTask.create_task("Corporation", { corporation_id: aggressor.corporation_id }, true);
			if (aggressor.alliance_id)
				BaseTask.create_task("Alliance", { alliance_id: aggressor.alliance_id }, true);

			if (defender.corporation_id)
				BaseTask.create_task("Corporation", { corporation_id: defender.corporation_id }, true);
			if (defender.alliance_id)
				BaseTask.create_task("Alliance", { alliance_id: defender.alliance_id }, true);

			allies.forEach(({ corporations_id, alliance_id }) => {
				if (corporations_id)
					BaseTask.create_task("Corporation", { corporations_id }, true);
				if (alliance_id)
					BaseTask.create_task("Alliance", { alliance_id }, true);
			});

			for (let page of new Array(1000).keys()) {
				let { obj } = await client.Wars.get_wars_war_id_killmails({ war_id: this.get_data().war_id, page });
				obj.forEach(({ killmail_id, killmail_hash }) => KillmailStore.find_or_create(killmail_id, killmail_hash));
				if (obj.length < 2000)
					break;
			}

			if (finished && finished < Date.now())
				await this.destroy();
			else
				await this.update({
					expires: new Date(headers.expires).getTime()
				});

		}

	}

	module.exports = WarTask;
