
	"use strict";

	const { EntityStore } = require("store/");

	class CorporationStore extends EntityStore {

	}

	CorporationStore.aggregations = [
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
		},
		{
			$lookup: {
				from: 			"characters",
				localField: 	"ceo_id",
				foreignField: 	"id",
				as: 			"ceo"
			}
		},
		{
			$unwind: {
				path: 			"$ceo",
				preserveNullAndEmptyArrays: true
			}
		}
	];

	module.exports = CorporationStore;
	