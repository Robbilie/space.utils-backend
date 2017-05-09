
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");
	const { CorporationStore } = require("store/");

	class CorporationTask extends BaseTask {

		async start () {

			const client = await ESIUtil.get_client();

			let [{ body: corporation, headers }, old_corporation] = await Promise.all([
				client.apis.Corporation.get_corporations_corporation_id(this.get_data()),
				CorporationStore.find_by_id(this.get_data().corporation_id).get_future()
			]);

			let alliance_history = undefined;
			if (old_corporation && old_corporation.alliance_history && old_corporation.alliance_id === corporation.alliance_id) {
				alliance_history = old_corporation.alliance_history;
			} else {
				let { body: history } = await client.apis.Corporation.get_corporations_corporation_id_alliancehistory(this.get_data());
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

			let { ceo_id, alliance_id, member_count } = corporation;

			let hash = ESIUtil.hash(corporation);

			if (hash !== this.get_info().hash) {

				await this.get_store().replace(
					{ id: corporation.id },
					corporation,
					{ upsert: true }
				);

				// get alliance
				if(alliance_id)
					this.enqueue_reference("Alliance", alliance_id);

				// get all alliances
				if (alliance_history)
					alliance_history
						.filter(({ alliance }) => !!alliance)
						.map(({ alliance: { alliance_id } }) => this.enqueue_reference("Alliance", alliance_id));

				// get ceo
				if(ceo_id === 1) {
					// dead corp
				} else if(ceo_id >= 3000000 && ceo_id < 4000000) {
					// is npc ceo
				} else if (ceo_id) {
					this.enqueue_reference("Character", ceo_id);
				} else {
					console.log("no ceo", this.get_data().corporation_id);
				}

			}

			await this.update({
				expires: (ceo_id === 1 || member_count === 0) ? Number.MAX_SAFE_INTEGER : new Date(headers.expires).getTime(),
				hash
			});

		}

	}

	module.exports = CorporationTask;
