
	"use strict";

	const { BaseTask, CharacterAffiliationTask } = require("task/");
	const { DB, ESI, Hash } = require("util/");

	class CharacterTask extends BaseTask {

		async start () {

			let [{ body: character }, old_character] = await Promise.all([
				ESI.Character.get_characters_character_id(this.get_data()),
				DB.collection("characters").findOne({ id: this.get_data().character_id })
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

			const { id, corporation_id, alliance_id } = character;

			const hash = Hash(character);
			if (hash !== this.get_info().hash) {

				await DB.collection("characters").replaceOne(
					{ id },
					character,
					{ upsert: true }
				);

				// is a new char so add to an affiliation task
				if (!old_character)
					await CharacterAffiliationTask.queue_id(id);

				// get corp
				this.enqueue_reference("Corporation", corporation_id);

				// if in an alliance, get alli
				if (alliance_id !== undefined)
					this.enqueue_reference("Alliance", alliance_id);

				// get all corps from history
				if (corporation_history)
					corporation_history
						.forEach(({ corporation_id }) => this.enqueue_reference("Corporation", corporation_id));

			}

			let expires;
			if (corporation_id === 1000001) {
				expires = Number.MAX_SAFE_INTEGER; // doomheimed
			} else {
				expires = Date.now() + (1000 * 60 * 60 * 24); // wait for 24h and let char affiliation do the rest
			}

			await this.update({ expires, hash });

		}

	}

	module.exports = CharacterTask;
