	
	"use strict";
	
	const { Corporation } = require("model");
	
	module.exports = {
		types: {
			id: 					Number,
			name: 					String,
			executor: 				Corporation,
			corporations: 			Array
		},
		aggregations: [
			{
				$lookup: {
					from: 			"corporations",
					localField: 	"executor",
					foreignField: 	"id",
					as: 			"executor"
				}
			},
			{
				$unwind: {
					path: 			"$executor",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 			"corporations",
					localField: 	"id",
					foreignField: 	"alliance",
					as: 			"corporations"
				}
			},
			{
				$unwind: {
					path: 			"$corporations",
					preserveNullAndEmptyArrays: true
				}
			}
		]
	};
