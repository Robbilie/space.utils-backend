
	"use strict";

	const { BaseTask, CharacterAffiliationTask } = require("task/");
	const { DB, ESI } = require("util/");

	class CharacterTask extends BaseTask {

		async start () {

			let { body: character, headers } = await this.getCachedData(ESI.Character.get_characters_character_id);

			let expires;
			if (character) {

				character = Object.assign(character, {
					id: 				this.get_data().character_id,
					birthday: 			new Date(character.birthday).getTime()
				});

				const { id, corporation_id, alliance_id } = character;

				let { body: history } = await ESI.Character.get_characters_character_id_corporationhistory(this.get_data());

				character = Object.assign(character, {
					corporation_history: history.map(entry => Object.assign(entry, { start_date: new Date(entry.start_date).getTime() }))
				});

				await DB.collection("characters").replaceOne(
					{ id },
					character,
					{ upsert: true }
				);

				// is a new char so add to an affiliation task
				if (this.get_info().hash === undefined)
					await CharacterAffiliationTask.queue_id(id);

				// get corporation
				this.enqueue_reference("Corporation", corporation_id);

				// if in an alliance, get alliance
				if (alliance_id !== undefined)
					this.enqueue_reference("Alliance", alliance_id);

				// get all corps from history
				if (character.corporation_history)
					character.corporation_history
						.forEach(({ corporation_id }) => this.enqueue_reference("Corporation", corporation_id));

				if (corporation_id === 1000001) {
					expires = Number.MAX_SAFE_INTEGER; // doomheimed
				}
			}

			if (!expires) {
				expires = new Date(headers.expires).getTime();
			}

			await this.update({ expires, hash: headers.etag });

		}

	}

	module.exports = CharacterTask;
