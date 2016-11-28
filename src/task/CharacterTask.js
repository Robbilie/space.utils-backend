
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");

	class CharacterTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let character_response = await client.Character.get_characters_character_id(this.get_data());
			let history_response = await client.Character.get_characters_character_id_corporationhistory(this.get_data());

			await this.get_store().update(
				{ id: this.get_data().character_id },
				{
					$set: {
						id: 					this.get_data().character_id,
						name: 					character_response.obj.name,
						corporation_id: 		character_response.obj.corporation_id,
						corporation_history: 	history_response.obj
					}
				},
				{ upsert: true }
			);

			// get corp
			await BaseTask.create_task("Corporation", { corporation_id: character_response.obj.corporation_id });

			// get all corps from history
			await Promise.all(history_response.obj.map(({ corporation_id }) => BaseTask.create_task("Corporation", { corporation_id })));

			await this.update({
				expires: Math.max(new Date(character_response.headers.expires).getTime(), new Date(history_response.headers.expires).getTime())
			});

		}

	}

	module.exports = CharacterTask;
