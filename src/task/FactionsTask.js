
	"use strict";

	const { BaseTask } 		= require("task/");
	const { ESIUtil } 		= require("util/");
	const { FactionStore, CorporationStore, SystemStore } 	= require("store/");

	class FactionsTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let { obj: factions, headers } = await client.Universe.get_universe_factions();

			await Promise.all(factions
				.map(faction => Object.assign({}, faction, { id: faction.faction_id, faction_id: undefined }))
				.map(faction => {
					if (faction.corporation_id)
						this.enqueue_reference("Corporation", faction.corporation_id);
					if (faction.solar_system_id)
						this.enqueue_reference("System", faction.solar_system_id);
					return FactionStore.update({ id: faction.id }, { $set: faction }, { upsert: true });
				})
			);

			await this.update({
				expires: new Date(headers.expires).getTime()
			});

		}

	}

	module.exports = FactionsTask;
