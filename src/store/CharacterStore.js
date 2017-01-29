
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
				localField: 	"corporation.alliance_id",
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
