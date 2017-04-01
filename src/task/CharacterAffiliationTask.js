
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");

	class CharacterAffiliationTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			const [{ obj: character_affiliations, headers }, characters] = await Promise.all([
				client.Character.post_characters_affiliation(this.get_data()),
				CharacterStore
					.from_cursor(c => c
						.find({ id: { $in: this.get_data().characters } })
						.project({ id: 1, corporation_id: 1, alliance_id: 1 })
					)
					.map(char => char.get_future())
			]);

			await Promise.all(character_affiliations
				.map(affiliation => [affiliation, characters.find(character => character.id === affiliation.character_id) || {}])
				.filter(([{ corporation_id, alliance_id }, old]) => corporation_id !== old.corporation_id || alliance_id !== old.alliance_id)
				.map(([{ character_id }]) => TaskStore.update({ "data.character_id": character_id, "info.name": "Character" }, { $set: { "info.expires": Date.now() } }))
			);

			await this.update({ expires: Date.now() + (1000 * 60 * 15) });

		}

		static queue_id (id) {
			return CharacterAffiliationTask.queue_ids([id]);
		}

		static queue_ids (ids) {
			return BaseTask.get_tasks().update(
				{ "info.name": "CharacterAffiliation", "info.count": { $lt: 251 - ids.length } },
				{
					$setOnInsert: {
						data: {
							characters: []
						},
						info: {
							name: "CharacterAffiliation",
							state: 0,
							expires: 0,
							modified: 0,
							count: 0
						}
					},
					$addToSet: {
						"data.characters": {
							$each: ids
						}
					},
					$inc: {
						"info.count": ids.length
					}
				},
				{ upsert: true }
			);
		}

	}

	module.exports = CharacterAffiliationTask;
