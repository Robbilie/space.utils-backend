
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");
	const { CorporationStore } = require("store/");

	class CharacterTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let [{ obj: character, headers }, { obj: corporation_history }] = await Promise.all([
				client.Character.get_characters_character_id(this.get_data()),
				client.Character.get_characters_character_id_corporationhistory(this.get_data())
			]);

			character = Object.assign(character, {
				id: 					this.get_data().character_id,
				birthday: 				new Date(character.birthday).getTime(),
				corporation_history: 	corporation_history.map(entry => Object.assign(entry, { start_date: new Date(entry.start_date).getTime() }))
			});

			await this.get_store().update(
				{ id: character.id },
				{ $set: character },
				{ upsert: true, w: 0 }
			);

			// get corp
			CorporationStore.find_or_create(character.corporation_id, true);

			// get all corps from history
			corporation_history.forEach(({ corporation_id }) => CorporationStore.find_or_create(corporation_id, true));

			if (character.corporation_id == 1000001)
				await this.destroy();
			else
				await this.update({
					expires: new Date(headers.expires).getTime()
				});

		}

	}

	module.exports = CharacterTask;
