
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");
	const { CorporationStore } = require("store/");

	class CharacterTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let [character_response, history_response] = await Promise.all([
				client.Character.get_characters_character_id(this.get_data()),
				client.Character.get_characters_character_id_corporationhistory(this.get_data())
			]);

			let character = character_response.obj;
				character.id = this.get_data().character_id;
				character.birthday = new Date(character.birthday).getTime();
				character.corporation_history = history_response.obj.map(entry => Object.assign(entry, { start_date: new Date(entry.start_date).getTime() }));

			await this.get_store().update(
				{ id: this.get_data().character_id },
				{ $set: character },
				{ upsert: true, w: 0 }
			);

			let { corporation_id } = character;

			// get corp
			CorporationStore.find_or_create(corporation_id);

			// get all corps from history
			history_response.obj.forEach(({ corporation_id }) => CorporationStore.find_or_create(corporation_id));

			if (corporation_id == 1000001)
				await this.destroy();
			else
				await this.update({
					expires: new Date(character_response.headers.expires).getTime()
				});

		}

	}

	module.exports = CharacterTask;
