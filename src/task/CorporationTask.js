
	"use strict";

	const { BaseTask } = require("task/");
	const { DB, ESI } = require("util/");

	class CorporationTask extends BaseTask {

		async start () {

			try {
				let { body: corporation, headers } = await this.getCachedData((args) => ESI.Corporation.get_corporations_corporation_id(args));

				let expires;
				if (corporation) {

					corporation = Object.assign(corporation, {
						id: 				this.get_data().corporation_id,
					});

					// manage optional convert
					if (corporation.date_founded)
						corporation.date_founded = new Date(corporation.date_founded).getTime();

					const { id, ceo_id, alliance_id, creator_id, member_count } = corporation;

					let { body: history } = await ESI.Corporation.get_corporations_corporation_id_alliancehistory(this.get_data());

					corporation = Object.assign(corporation, {
						alliance_history: history.map(entry => Object.assign(entry, { start_date: new Date(entry.start_date).getTime() }))
					});

					await DB.collection("corporations").replaceOne(
						{ id },
						corporation,
						{ upsert: true }
					);

					// get alliance
					if(alliance_id !== undefined)
						this.enqueue_reference("Alliance", alliance_id);

					// get creator
					if(creator_id !== undefined && creator_id !== 1)
						this.enqueue_reference("Character", creator_id);

					// get all alliances
					if (corporation.alliance_history)
						corporation.alliance_history
							.filter(({ alliance_id }) => alliance_id !== undefined)
							.map(({ alliance_id }) => this.enqueue_reference("Alliance", alliance_id));

					// get ceo
					if(ceo_id === 1) {
						// dead corp
					} else if(ceo_id >= 3000000 && ceo_id < 4000000) {
						// is npc ceo
					} else if (ceo_id !== undefined) {
						this.enqueue_reference("Character", ceo_id);
					} else {
						console.log("no ceo", this.get_data().corporation_id);
					}

					if (ceo_id === 1 || member_count === 0) {
						expires = Number.MAX_SAFE_INTEGER;
					} else if (alliance_id !== undefined) {
						expires = new Date(headers.expires).getTime() + (1000 * 60 * 60 * 24);
					}

				}

				if (!expires) {
					expires = new Date(headers.expires).getTime();
				}

				await this.update({ expires, hash: headers.etag });

			} catch (e) {
				console.log(e);
				throw e;
			}

		}

	}

	module.exports = CorporationTask;
