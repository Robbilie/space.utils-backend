
	"use strict";

	const { BaseTask } = require("task/");
	const { ESI } = require("util/");

	class NPCCorporationsTask extends BaseTask {

		async start () {

			const { body: npc_corporation_ids, headers } = await ESI.Corporation.get_corporations_npccorps();

			npc_corporation_ids
				.forEach(corporation_id => this.enqueue_reference("Corporation", corporation_id));

			await this.update({ expires: new Date(headers.expires).getTime() });

		}

	}

	module.exports = NPCCorporationsTask;
