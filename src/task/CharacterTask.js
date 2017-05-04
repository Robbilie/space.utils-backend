
	"use strict";

	const { BaseTask, CharacterAffiliationTask } = require("task/");
	const { ESIUtil } = require("util/");
	const { CharacterStore } = require("store/");

	class CharacterTask extends BaseTask {

		async start () {

			const client = await ESIUtil.get_client();

			let [{ body: character }, old_char] = await Promise.all([
				client.apis.Character.get_characters_character_id(this.get_data()),
				CharacterStore.find_by_id(this.get_data().character_id).get_future()
			]);

			let corporation_history = undefined;
			if (old_char && old_char.corporation_history && old_char.corporation_id === character.corporation_id) {
				corporation_history = old_char.corporation_history;
			} else {
				let { body: history } = await client.apis.Character.get_characters_character_id_corporationhistory(this.get_data());
				corporation_history = history.map(entry => Object.assign(entry, { start_date: new Date(entry.start_date).getTime() }));
			}

			character = Object.assign(character, {
				id: 				this.get_data().character_id,
				birthday: 			new Date(character.birthday).getTime(),
				corporation_history
			});

			await this.get_store().replace(
				{ id: character.id },
				character,
				{ upsert: true }
			);

			let { id, corporation_id, alliance_id } = character;

			if (!old_char)
				await CharacterAffiliationTask.queue_id(id);

			// get corp
			this.enqueue_reference("Corporation", corporation_id);

			if (alliance_id)
				this.enqueue_reference("Alliance", alliance_id);

			// get all corps from history
			if (corporation_history)
				corporation_history
					.forEach(({ corporation_id }) => this.enqueue_reference("Corporation", corporation_id));

			if (corporation_id === 1000001)
				await this.destroy();
			else
				await this.update({ expires: Date.now() + (1000 * 60 * 60 * 24) /*new Date(headers.expires).getTime()*/ });

		}

	}

	module.exports = CharacterTask;
