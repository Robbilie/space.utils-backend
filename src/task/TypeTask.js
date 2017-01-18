
	"use strict";

	const { BaseTask } 				= require("task/");
	const { ESIUtil } 				= require("util/");

	class TypeTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let type_response = await client.Universe.get_universe_types_type_id(this.get_data());
			let type = type_response.obj;
				type.id = type.type_id;
				delete type.type_id;

			await this.get_store().insert(type, { w: 0 });

			await this.destroy();

		}

	}

	module.exports = TypeTask;
