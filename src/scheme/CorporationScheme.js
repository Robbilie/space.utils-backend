
	"use strict";

	module.exports = {
		types: {
			id: 					Number,
			name: 					String,
			ticker: 				String,
			description: 			String,
			ceo: 					"Character",
			alliance: 				"Alliance"
		},
		aggregations: [
			{
				$lookup: {
					from: 			"alliances",
					localField: 	"alliance",
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
					localField: 	"ceo",
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
