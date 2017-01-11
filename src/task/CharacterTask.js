
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");

	class CharacterTask extends BaseTask {

		async start () {

			let start = Date.now();
			let times = [];

			let client = await ESIUtil.get_client();

			times.push(Date.now() - start);

			let [character_response, history_response] = await Promise.all([
				client.Character.get_characters_character_id(this.get_data()),
				client.Character.get_characters_character_id_corporationhistory(this.get_data())
			]);

			times.push(Date.now() - start);

			let { name, corporation_id } = character_response.obj;

			await this.get_store().update(
				{ id: this.get_data().character_id },
				{
					$set: {
						name,
						corporation_id,
						corporation_history: history_response.obj.map(entry => Object.assign(entry, { start_date: new Date(entry.start_date).getTime() }))
					}
				},
				{ upsert: true, w: 0 }
			);

			times.push(Date.now() - start);

			// get corp
			BaseTask.create_task("Corporation", { corporation_id }, true);

			times.push(Date.now() - start);

			// get all corps from history
			history_response.obj.forEach(({ corporation_id }) => BaseTask.create_task("Corporation", { corporation_id }, true));

			times.push(Date.now() - start);

			await this.update({
				expires: new Date(character_response.headers.expires).getTime()
			});

			times.push(Date.now() - start);

			//console.log("character", ...times);

		}

	}

	module.exports = CharacterTask;
