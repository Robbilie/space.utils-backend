
	"use strict";

	const { BaseTask } 				= require("task/");
	const { ESIUtil } 				= require("util/");

	class SystemTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let { body: system } = await client.apis.Universe.get_universe_systems_system_id(this.get_data());

			system = Object.assign(system, {
				id: 			system.system_id,
				system_id: 		undefined
			});

			await this.get_store().insert(system);

			await this.destroy();

		}

	}

	module.exports = SystemTask;
