
	"use strict";

	const { BaseTask } 		= require("task/");
	const { ESIUtil } 		= require("util/");
	const { KillmailStore, CorporationStore, AllianceStore } = require("store/");

	class WarTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let { obj: war, headers } = await client.Wars.get_wars_war_id(this.get_data());

				if(war.declared)
					war.declared = new Date(war.declared).getTime();
				if(war.started)
					war.started = new Date(war.started).getTime();
				if(war.finished)
					war.finished = new Date(war.finished).getTime();
				if(war.retracted)
					war.retracted = new Date(war.retracted).getTime();

			let { finished, aggressor, defender, allies = [] } = war;

			await this.get_store().update(
				{ id: this.get_data().war_id },
				{ $set: war },
				{ upsert: true, w: 0 }
			);

			if (aggressor.corporation_id)
				CorporationStore.find_or_create(aggressor.corporation_id, true);
			if (aggressor.alliance_id)
				AllianceStore.find_or_create(aggressor.alliance_id, true);

			if (defender.corporation_id)
				CorporationStore.find_or_create(defender.corporation_id, true);
			if (defender.alliance_id)
				AllianceStore.find_or_create(defender.alliance_id, true);

			allies.forEach(({ corporation_id, alliance_id }) => {
				if (corporation_id)
					CorporationStore.find_or_create(corporation_id, true);
				if (alliance_id)
					AllianceStore.find_or_create(alliance_id, true);
			});

			await this.get_killmail_pages(client, this.get_info().page);

			if (finished && finished < Date.now())
				await this.destroy();
			else
				await this.update({
					expires: new Date(headers.expires).getTime()
				});

		}

		async get_killmail_pages (client, page = 1) {
			let { obj } = await client.Wars.get_wars_war_id_killmails({ war_id: this.get_data().war_id, page });

			const ids = await KillmailStore
				.from_cursor(c => c.find({ id: { $in: obj.map(({ killmail_id }) => killmail_id) } }))
				.map(killmail => killmail.get_id());

			for (let { killmail_id, killmail_hash } of obj.filter(id => !ids.includes(id))) {
				await KillmailStore.find_or_create(killmail_id, killmail_hash, true);
				await this.tick();
			}

			/*
			for (let { killmail_id, killmail_hash } of obj) {
				await KillmailStore.find_or_create(killmail_id, killmail_hash);
				await this.tick();
			}
			*/
			if (obj.length == 2000)
				return await this.get_killmail_pages(client, page + 1);
			else
				return await this.tick({ page });
		}

	}

	module.exports = WarTask;
