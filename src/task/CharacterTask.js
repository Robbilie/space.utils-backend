
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");

	class CharacterTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let now = Date.now();
			let [character_response, history_response] = await Promise.all([
				client.Character.get_characters_character_id(this.get_data()),
				client.Character.get_characters_character_id_corporationhistory(this.get_data())
			]);
			console.log("character requests", Date.now() - now);

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
				{ upsert: true, w: 0 }
			);

			// get corp
			BaseTask.create_task("Corporation", { corporation_id: character_response.obj.corporation_id }, true);

			// get all corps from history
			history_response.obj.forEach(({ corporation_id }) => BaseTask.create_task("Corporation", { corporation_id }, true));

			await this.update({
				expires: Math.max(new Date(character_response.headers.expires).getTime(), new Date(history_response.headers.expires).getTime())
			});

		}

	}

	module.exports = CharacterTask;
