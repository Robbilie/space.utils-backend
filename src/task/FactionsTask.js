
	"use strict";

	const { BaseTask } 		= require("task/");
	const { DB, ESI } 		= require("util/");

	class FactionsTask extends BaseTask {

		async start () {

			let { body: factions, headers } = await ESI.Universe.get_universe_factions();

			await Promise.all(factions
				.map(faction => Object.assign({}, faction, { id: faction.faction_id, faction_id: undefined }))
				.map(faction => {
					if (faction.corporation_id !== undefined)
						this.enqueue_reference("Corporation", faction.corporation_id);
					if (faction.militia_corporation_id !== undefined)
						this.enqueue_reference("Corporation", faction.militia_corporation_id);
					if (faction.solar_system_id !== undefined)
						this.enqueue_reference("System", faction.solar_system_id);
					return DB.collection("factions").replaceOne({ id: faction.id }, faction, { upsert: true });
				})
			);

			await this.update({
				expires: new Date(headers.expires).getTime()
			});

		}

	}

	module.exports = FactionsTask;
