
	"use strict";

	const { BaseTask } 				= require("task/");
	const { ESIUtil } 				= require("util/");

	class SystemTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let { obj: system } = await client.Universe.get_universe_systems_system_id(this.get_data());

			system = Object.assign(system, {
				id: 				this.get_data().system_id,
				name: 				system.solar_system_name,
				solar_system_name: 	undefined
			});

			await this.get_store().insert(system);

			await this.destroy();

		}

	}

	module.exports = SystemTask;
