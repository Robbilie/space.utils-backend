
	"use strict";

	const { EntityStore } = require("store/");

	class CharacterStore extends EntityStore {

	}

	CharacterStore.aggregations = [
		{
			$lookup: {
				from: 			"corporations",
				localField: 	"corporation_id",
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
				localField: 	"alliance_id",
				foreignField: 	"id",
				as: 			"alliance"
			}
		},
		{
			$unwind: {
				path: 			"$alliance",
				preserveNullAndEmptyArrays: true
			}
		}
	];

	module.exports = CharacterStore;
