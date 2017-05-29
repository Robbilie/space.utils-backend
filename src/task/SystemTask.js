
	"use strict";

	const { BaseTask } = require("task/");
	const { DB, ESI } = require("util/");

	class SystemTask extends BaseTask {

		async start () {

			let { body: system } = await ESI.Universe.get_universe_systems_system_id(this.get_data());

			system = Object.assign(system, {
				id: 			system.system_id,
				system_id: 		undefined
			});

			await DB.systems.replaceOne(
				{ id: system.id },
				system,
				{ upsert: true }
			);

			await this.destroy();

		}

	}

	module.exports = SystemTask;
