
	"use strict";

	const { ObjectId } = require("mongodb");

	module.exports = {
		types: {
			_id: 					ObjectId,
			killID: 				Number,
			hash: 					String,
			solarSystem: 			"System",
			killTime: 				String,
			attackers: 				Array,
			attackerCount: 			Number,
			victim: 				Object
		},
		aggregations: [
			{
				$lookup: {
					from: 			"systems",
					localField: 	"solarSystem",
					foreignField: 	"id",
					as: 			"solarSystem"
				}
			}
		]
	};
