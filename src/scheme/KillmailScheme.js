
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
					localField: 	"solarSystemID",
					foreignField: 	"id",
					as: 			"solarSystem"
				}
			},
			{
				$unwind: {
					path: 			"solarSystem",
					preserveNullAndEmptyArrays: true
				}
			}
		]
	};
