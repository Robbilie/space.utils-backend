	
	"use strict";
	
	const { Corporation, List } = require("model/");
	
	module.exports = {
		types: {
			id: 					Number,
			name: 					String,
			shortName: 				String,
			executor: 				Corporation,
			corporations: 			List.bind(List, Corporation)
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
			}
		]
	};
