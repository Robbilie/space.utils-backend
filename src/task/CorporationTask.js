
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");
	const { CharacterStore, CorporationStore, AllianceStore } = require("store/");

	class CorporationTask extends BaseTask {

		async start () {

			let tss = [Date.now()];

			let client = await ESIUtil.get_client();

			tss.push(Date.now());

			let [{ body: corporation, headers }, old_corp] = await Promise.all([
				client.apis.Corporation.get_corporations_corporation_id(this.get_data()),
				CorporationStore.find_by_id(this.get_data().corporation_id).get_future()
			]);

			tss.push(Date.now());

			let alliance_history = null;
			if (!old_corp || (old_corp && old_corp.alliance_id != corporation.alliance_id)) {
				let { body: history } = await client.apis.Corporation.get_corporations_corporation_id_alliancehistory(this.get_data());
				alliance_history = history;
			}

			tss.push(Date.now());

			corporation = Object.assign(corporation, {
				id: 				this.get_data().corporation_id,
				name: 				corporation.name || corporation.corporation_name,
				corporation_name: 	undefined
			}, alliance_history ? {
				alliance_history:	alliance_history.map(entry => Object.assign(entry, { start_date: new Date(entry.start_date).getTime() }))
			} : {});

			tss.push(Date.now());

			let { ceo_id, alliance_id, member_count } = corporation;

			await this.get_store().update(
				{ id: corporation.id },
				{
					$set: corporation,
					$unset: { [alliance_id ? "unset" : "alliance_id"]: true }
				},
				{ upsert: true }
			);

			tss.push(Date.now());

			// get alliance
			if(alliance_id)
				this.enqueue_reference("Alliance", alliance_id);

			tss.push(Date.now());

			// get all alliances
			if (alliance_history)
				alliance_history
					.filter(({ alliance }) => !!alliance)
					.map(({ alliance: { alliance_id } }) => this.enqueue_reference("Alliance", alliance_id));

			tss.push(Date.now());

			// get ceo
			if(ceo_id == 1) {
				// dead corp
			} else if(ceo_id >= 3000000 && ceo_id < 4000000) {
				// is npc ceo
			} else if (ceo_id) {
				this.enqueue_reference("Character", ceo_id);
			} else {
				console.log("no ceo", this.get_data().corporation_id);
			}

			tss.push(Date.now());

			if(ceo_id == 1 || member_count == 0)
				await this.destroy();
			else
				await this.update({ expires: new Date(headers.expires).getTime() });

			tss.push(Date.now());

			//console.log("corporation", ...tss.map((t, i, a) => t - (a[i - 1] || t)));

		}

	}

	module.exports = CorporationTask;
