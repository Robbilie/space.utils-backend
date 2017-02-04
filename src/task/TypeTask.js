
	"use strict";

	const { BaseTask } 				= require("task/");
	const { ESIUtil } 				= require("util/");

	class TypeTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let { obj: type } = await client.Universe.get_universe_types_type_id(this.get_data());

			type = Object.assign(type, {
				id: 		type.type_id,
				type_id: 	undefined
			});

			await this.get_store().insert(type, { w: 0 });

			await this.destroy();

		}

	}

	module.exports = TypeTask;
