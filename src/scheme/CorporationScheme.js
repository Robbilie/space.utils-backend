
	"use strict";

	const { Character, Alliance } = require("model/");

	module.exports = {
		types: {
			id: 					Number,
			name: 					String,
			ticker: 				String,
			ceo: 					Character,
			alliance: 				Alliance
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
