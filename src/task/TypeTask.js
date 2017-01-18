
	"use strict";

	const { BaseTask } 				= require("task/");
	const { ESIUtil } 				= require("util/");

	class TypeTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let type_response = await client.Universe.get_universe_types_type_id(this.get_data());

			await this.get_store().insert({
				id: 			this.get_data().type_id,
				name: 			type_response.obj.type_name,
				description: 	type_response.obj.type_description,
				group_id: 		type_response.obj.group_id,
				category_id: 	type_response.obj.category_id,
				published: 		type_response.obj.published
			}, { w: 0 });

			await this.destroy();

		}

	}

	module.exports = TypeTask;
