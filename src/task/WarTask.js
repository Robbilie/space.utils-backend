
	"use strict";

	const { BaseTask } = require("task/");
	const { ESI, hash } = require("util/");
	const { KillmailStore } = require("store/");

	class WarTask extends BaseTask {

		async start () {

			let { body: war, headers } = await ESI.Wars.get_wars_war_id(this.get_data());

				if(war.declared)
					war.declared = new Date(war.declared).getTime();
				if(war.started)
					war.started = new Date(war.started).getTime();
				if(war.finished)
					war.finished = new Date(war.finished).getTime();
				if(war.retracted)
					war.retracted = new Date(war.retracted).getTime();

			let { finished, aggressor, defender, allies } = war;

			let hash = hash(war);

			if (hash !== this.get_info().hash) {

				console.log("updateing war", this.get_data().war_id);

				await this.get_store().update(
					{ id: this.get_data().war_id },
					{ $set: war },
					{ upsert: true }
				);

				if (aggressor.corporation_id !== undefined)
					this.enqueue_reference("Corporation", aggressor.corporation_id);
				if (aggressor.alliance_id !== undefined)
					this.enqueue_reference("Alliance", aggressor.alliance_id);

				if (defender.corporation_id !== undefined)
					this.enqueue_reference("Corporation", defender.corporation_id);
				if (defender.alliance_id !== undefined)
					this.enqueue_reference("Alliance", defender.alliance_id);

				if (allies)
					allies.forEach(({ corporation_id, alliance_id }) => {
						if (corporation_id !== undefined)
							this.enqueue_reference("Corporation", corporation_id);
						if (alliance_id !== undefined)
							this.enqueue_reference("Alliance", alliance_id);
					});

			}

			console.log("getting killmails for war", this.get_data().war_id);

			await this.get_killmail_pages(this.get_info().page, true);

			await this.update({
				expires: (finished && finished < Date.now()) ? Number.MAX_SAFE_INTEGER : new Date(headers.expires).getTime(),
				hash
			});

		}

		async get_killmail_pages (page = 1, start = false) {
			const s = { length: 0 };

			console.log("killmail page war", this.get_data().war_id, page);


			{
				if (start === false)
					await this.tick({ page });

				const { body: killmails } = await ESI.Wars.get_wars_war_id_killmails({ war_id: this.get_data().war_id, page });
				s.length = killmails.length;

				console.log("war", this.get_data().war_id, killmails);

				const ids = await KillmailStore
					.from_cursor(c => c.find({ id: { $in: killmails.map(({ killmail_id }) => killmail_id) } }).project({ id: 1 }))
					.map(killmail => killmail.get_id());

				console.log("war", this.get_data().war_id, ids);

				console.log("war", this.get_data().war_id, killmails
					.filter(({ killmail_id }) => !ids.includes(killmail_id)));


				killmails
					.filter(({ killmail_id }) => !ids.includes(killmail_id))
					.forEach(({ killmail_id, killmail_hash }) => this.enqueue_reference("Killmail", killmail_id, killmail_hash));
			}

			if (s.length === 2000)
				return await this.get_killmail_pages(page + 1);
			else
				return true;
		}

	}

	module.exports = WarTask;
