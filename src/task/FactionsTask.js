
	"use strict";

	const { BaseTask } 		= require("task/");
	const { ESIUtil } 		= require("util/");
	const { FactionStore } 	= require("store/");

	class FactionsTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let { obj, headers } = await client.Universe.get_factions();

			await Promise.all(obj
				.map(faction => Object.assign({}, faction, { id: faction.faction_id, faction_id: undefined }))
				.map(faction => FactionStore.update({ id: faction.id}, { $set: faction } ))
			);

			await this.update({
				expires: new Date(headers.expires).getTime()
			});

		}

	}

	module.exports = FactionsTask;
