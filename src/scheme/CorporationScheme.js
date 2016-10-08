
	"use strict";

	module.exports = {
		types: {
			id: 					Number,
			name: 					String,
			ticker: 				String,
			description: 			String,
			ceo: 					"Character",
			alliance: 				"Alliance",
			updated: 				Number
		},
		aggregations: [
			{
				$lookup: {
					from: 			"alliances",
					localField: 	"allianceID",
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
					localField: 	"ceoID",
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
		]
	};
