
	"use strict";

	const { _Character, _Alliance } = require("model");

	module.exports = {
		types: {
			id: 				Number,
			name: 				String,
			ceo: 				_Character,
			alliance: 			_Alliance
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
