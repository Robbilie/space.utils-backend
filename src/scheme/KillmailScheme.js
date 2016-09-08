
	"use strict";

	const { ObjectId } = require("mongodb");

	module.exports = {
		types: {
			_id: 					ObjectId,
			killID: 				Number,
			hash: 					String,
			solarSystem: 			Object,
			killTime: 				String,
			attackers: 				Array,
			attackerCount: 			Number,
			victim: 				Object
		},
		aggregations: []
	};
