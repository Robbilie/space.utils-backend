
	"use strict";

	const { BaseTask } 				= require("task/");
	const { ESIUtil } 				= require("util/");

	class SystemTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let system_response = await client.Universe.get_universe_systems_system_id(this.get_data());

			await this.get_store().insert({
				id: 	this.get_data().system_id,
				name: 	system_response.obj.solar_system_name
			}, { w: 0 });

			await this.destroy();

		}

	}

	module.exports = SystemTask;
