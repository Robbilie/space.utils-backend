	
	"use strict";
	
	const { _Corporation } = require("model");
	
	module.exports = {
		types: {
			id: 				Number,
			name: 				String,
			executor: 			_Corporation
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
			}
		]
	};
