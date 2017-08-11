
	"use strict";

	const { BaseTask } = require("task/");
	const { DB, ESI, Hash } = require("util/");

	class CorporationTask extends BaseTask {

		async start () {

			let [{ body: corporation, headers }, old_corporation] = await Promise.all([
				ESI.Corporation.get_corporations_corporation_id(this.get_data()),
				DB.collection("corporations").findOne({ id: this.get_data().corporation_id })
			]);

			let alliance_history = undefined;
			if (old_corporation && old_corporation.alliance_history && old_corporation.alliance_id === corporation.alliance_id) {
				alliance_history = old_corporation.alliance_history;
			} else {
				let { body: history } = await ESI.Corporation.get_corporations_corporation_id_alliancehistory(this.get_data());
				alliance_history = history.map(entry => Object.assign(entry, { start_date: new Date(entry.start_date).getTime() }));
			}

			corporation = Object.assign(corporation, {
				id: 				this.get_data().corporation_id,
				name: 				corporation.name || corporation.corporation_name,
				description: 		corporation.description || corporation.corporation_description,
				alliance_history
			});

			// manage optional convert
			if (corporation.creation_date)
				corporation.creation_date = new Date(corporation.creation_date).getTime();

			// TODO : ESI should fix this
			delete corporation.corporation_name;
			delete corporation.corporation_description;

			const { id, ceo_id, alliance_id, creator_id, member_count } = corporation;

			const hash = Hash(corporation);
			if (hash !== this.get_info().hash) {

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
				if (alliance_history)
					alliance_history
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

			}

			let expires;
			if (ceo_id === 1 || member_count === 0) {
				expires = Number.MAX_SAFE_INTEGER;
			} else if (alliance_id !== undefined) {
				expires = Date.now() + (1000 * 60 * 60 * 24);
			} else {
				expires = new Date(headers.expires).getTime();
			}

			await this.update({ expires, hash });

		}

	}

	module.exports = CorporationTask;
