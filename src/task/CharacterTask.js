
	"use strict";

	const { BaseTask, CharacterAffiliationTask } = require("task/");
	const { ESI, hash } = require("util/");
	const { CharacterStore } = require("store/");

	class CharacterTask extends BaseTask {

		async start () {

			let [{ body: character }, old_character] = await Promise.all([
				ESI.Character.get_characters_character_id(this.get_data()),
				CharacterStore.find_by_id(this.get_data().character_id).get_future()
			]);

			let corporation_history = undefined;
			if (old_character && old_character.corporation_history && old_character.corporation_id === character.corporation_id) {
				corporation_history = old_character.corporation_history;
			} else {
				let { body: history } = await ESI.Character.get_characters_character_id_corporationhistory(this.get_data());
				corporation_history = history.map(entry => Object.assign(entry, { start_date: new Date(entry.start_date).getTime() }));
			}

			character = Object.assign(character, {
				id: 				this.get_data().character_id,
				birthday: 			new Date(character.birthday).getTime(),
				corporation_history
			});

			let { id, corporation_id, alliance_id } = character;

			let hash = hash(character);

			if (hash !== this.get_info().hash) {

				await this.get_store().replace(
					{ id: character.id },
					character,
					{ upsert: true }
				);

				if (!old_character)
					await CharacterAffiliationTask.queue_id(id);

				// get corp
				this.enqueue_reference("Corporation", corporation_id);

				if (alliance_id !== undefined)
					this.enqueue_reference("Alliance", alliance_id);

				// get all corps from history
				if (corporation_history)
					corporation_history
						.forEach(({ corporation_id }) => this.enqueue_reference("Corporation", corporation_id));

			}

			await this.update({
				expires: (corporation_id === 1000001) ? Number.MAX_SAFE_INTEGER : Date.now() + (1000 * 60 * 60 * 24),
				hash
			});

		}

	}

	module.exports = CharacterTask;
