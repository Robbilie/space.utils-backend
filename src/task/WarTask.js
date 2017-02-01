
	"use strict";

	const { BaseTask } 		= require("task/");
	const { ESIUtil } 		= require("util/");
	const { KillmailStore, CorporationStore, AllianceStore } = require("store/");

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
				CorporationStore.find_or_create(aggressor.corporation_id);
			if (aggressor.alliance_id)
				AllianceStore.find_or_create(aggressor.alliance_id);

			if (defender.corporation_id)
				CorporationStore.find_or_create(defender.corporation_id);
			if (defender.alliance_id)
				AllianceStore.find_or_create(defender.alliance_id);

			allies.forEach(({ corporation_id, alliance_id }) => {
				if (corporation_id)
					CorporationStore.find_or_create(corporation_id);
				if (alliance_id)
					AllianceStore.find_or_create(alliance_id);
			});

			console.log("war task before kills");

			for (let ind of new Array(1000).keys()) {
				let { obj } = await client.Wars.get_wars_war_id_killmails({ war_id: this.get_data().war_id, page: ind + 1 });
				obj.forEach(({ killmail_id, killmail_hash }) => KillmailStore.find_or_create(killmail_id, killmail_hash));
				if (obj.length < 2000)
					break;
			}

			console.log("war task after kills");

			if (finished && finished < Date.now())
				await this.destroy();
			else
				await this.update({
					expires: new Date(headers.expires).getTime()
				});

		}

	}

	module.exports = WarTask;
