
	"use strict";

	const { BaseTask } 				= require("task/");
	const { ESIUtil } 				= require("util/");

	class TypeTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let { body: type } = await client.apis.Universe.get_universe_types_type_id(this.get_data());

			type = Object.assign(type, {
				id: 		type.type_id,
				type_id: 	undefined
			});

			await this.get_store().insert(type);

			await this.destroy();

		}

	}

	module.exports = TypeTask;
