
	"use strict";

	const { BaseTask } 				= require("task/");
	const { ESIUtil } 				= require("util/");

	class TypeTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let type_response = await client.Universe.get_universe_types_type_id(this.get_data());

			let types = await this.get_collection();

			await types.update(
				{ id: this.get_data().type_id },
				{
					$set: {
						id: 			this.get_data().type_id,
						name: 			type_response.obj.type_name,
						description: 	type_response.obj.type_description,
						group_id: 		type_response.obj.group_id,
						category_id: 	type_response.obj.category_id
					}
				},
				{ upsert: true }
			);

			await this.update({
				state: 2,
				timestamp: new Date(type_response.expires).getTime()
			});

		}

	}

	module.exports = TypeTask;
