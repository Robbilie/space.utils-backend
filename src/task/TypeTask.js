
	"use strict";

	const { BaseTask } 				= require("task/");
	const { ESI } 				= require("util/");

	class TypeTask extends BaseTask {

		async start () {

			let { body: type } = await ESI.Universe.get_universe_types_type_id(this.get_data());

			type = Object.assign(type, {
				id: 		type.type_id,
				type_id: 	undefined
			});

			await this.get_store().insert(type);

			await this.destroy();

		}

	}

	module.exports = TypeTask;
