
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
						CorporationStore.find_or_create(faction.corporation_id, true);
					if (faction.solar_system_id)
						SystemStore.find_or_create(faction.solar_system_id, true);
					return FactionStore.update({ id: faction.id }, { $set: faction } );
				})
			);

			await this.update({
				expires: new Date(headers.expires).getTime()
			});

		}

	}

	module.exports = FactionsTask;
