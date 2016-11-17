
	"use strict";

	const { EntityStore } = require("store/");
	const { CharacterTask } = require("task/");

	class CharacterStore extends EntityStore {

		static async find_or_create (character_id, {} = $(1, { character_id }, "Number")) {

			try {

				let character = await this.find_by_id(character_id);

				if(await character.is_null())
					await CharacterTask.create({ character_id });

				character = await this.find_by_id(character_id);

				/*
				if(await character.is_null())
					await NPCAffiliationTask.create({ ids: [character_id] });

				character = await this.find_by_id(character_id);
				*/

				if(await character.is_null())
					console.log("MISSING CHAR", character_id);

				return character.get_future();

			} catch (e) { console.log(e, new Error()); }

		}

	}

	CharacterStore.aggregations = [
		{
			$lookup: {
				from: 			"corporations",
				localField: 	"corporationID",
				foreignField: 	"id",
				as: 			"corporation"
			}
		},
		{
			$unwind: {
				path: 			"$corporation",
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$lookup: {
				from: 			"alliances",
				localField: 	"corporation.allianceID",
				foreignField: 	"id",
				as: 			"corporation.alliance"
			}
		},
		{
			$unwind: {
				path: 			"$corporation.alliance",
				preserveNullAndEmptyArrays: true
			}
		}
	];

	module.exports = CharacterStore;
