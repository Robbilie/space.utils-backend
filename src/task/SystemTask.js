
	"use strict";

	const { BaseTask } 				= require("task/");
	const { ESIUtil } 				= require("util/");

	class SystemTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let system_response = await client.Universe.get_universe_systems_system_id(this.get_data());
			let system = system_response.obj;
				system.id = this.get_data().system_id;
				system.name = system.solar_system_name;
				delete system.solar_system_name;

			await this.get_store().insert(system, { w: 0 });

			await this.destroy();

		}

	}

	module.exports = SystemTask;
