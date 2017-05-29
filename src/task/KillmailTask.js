
	"use strict";

	const { BaseTask } = require("task/");
	const { DB, ESI } = require("util/");

	class KillmailTask extends BaseTask {

		async start () {

			let { body: killmail } = await ESI.Killmails.get_killmails_killmail_id_killmail_hash(this.get_data());

			killmail = Object.assign(killmail, {
				id: 				this.get_data().killmail_id,
				hash: 				this.get_data().killmail_hash,
				attacker_count: 	killmail.attackers.length,
				time: 				new Date(killmail.killmail_time).getTime(),
				killmail_id: 		undefined,
				killmail_time: 		undefined
			});

			//await this.get_store().insert(killmail);

			await DB.killmails.replaceOne(
				{ id: this.get_data().killmail_id },
				killmail,
				{ upsert: true }
			);

			if (killmail.victim) {
				let { character_id, corporation_id, alliance_id } = killmail.victim;
				if (character_id !== undefined)
					this.enqueue_reference("Character", character_id);
				if (corporation_id !== undefined)
					this.enqueue_reference("Corporation", corporation_id);
				if (alliance_id !== undefined)
					this.enqueue_reference("Alliance", alliance_id);
			}

			if (killmail.attackers)
				killmail.attackers.forEach(({ character_id, corporation_id, alliance_id }) => {
					if (character_id !== undefined)
						this.enqueue_reference("Character", character_id);
					if (corporation_id !== undefined)
						this.enqueue_reference("Corporation", corporation_id);
					if (alliance_id !== undefined)
						this.enqueue_reference("Alliance", alliance_id);
				});

			await this.destroy();

		}

	}

	module.exports = KillmailTask;
