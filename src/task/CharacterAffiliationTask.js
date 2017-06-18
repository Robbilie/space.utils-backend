
	"use strict";

	const { BaseTask } = require("task/");
	const { DB, ESI } = require("util/");

	class CharacterAffiliationTask extends BaseTask {

		async start () {

			const [{ body: character_affiliations, headers }, characters] = await Promise.all([
				ESI.Character.post_characters_affiliation(this.get_data()),
				DB
					.collection("characters")
					.find({ id: { $in: this.get_data().characters } })
					.project({ id: 1, corporation_id: 1, alliance_id: 1 })
					.toArray()
			]);

			let ids = character_affiliations
				.map(affiliation => [affiliation, characters.find(character => character.id === affiliation.character_id) || {}])
				.filter(([{ corporation_id, alliance_id }, old]) => corporation_id !== old.corporation_id || alliance_id !== old.alliance_id)
				.map(([{ character_id }]) => character_id);

			if (ids.length !== 0) {
				await DB.collection("tasks").updateMany({ "info.name": "Character", "data.character_id": { $in: ids } }, { $set: { "info.expires": Date.now() } });
			}

			await this.update({ expires: Date.now() + (1000 * 60 * 15) });

		}

		static queue_id (id) {
			return CharacterAffiliationTask.queue_ids([id]);
		}

		static queue_ids (ids = []) {
			return DB.collection("tasks").updateOne(
				{ "info.name": "CharacterAffiliation", "info.count": { $lt: 1000 + 1 - ids.length } },
				{
					$setOnInsert: {
						"info.name": "CharacterAffiliation",
						"info.state": 0,
						"info.expires": 0,
						"info.modified": 0
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
