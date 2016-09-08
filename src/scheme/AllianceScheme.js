	
	"use strict";
	
	module.exports = {
		types: {
			id: 					Number,
			name: 					String,
			shortName: 				String,
			executor: 				"Corporation",
			corporations: 			"CorporationList",
			updated: 				Number
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
