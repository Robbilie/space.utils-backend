	
	"use strict";
	
	const { Corporation } = require("model/");
	
	module.exports = {
		types: {
			id: 					Number,
			name: 					String,
			executor: 				Corporation,
			corporations: 			Promise
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
