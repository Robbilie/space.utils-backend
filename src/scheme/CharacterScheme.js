
	"use strict";

	module.exports = {
		types: {
			id: 					Number,
			name: 					String,
			corporation: 			"Corporation",
			updated: 				Number
		},
		aggregations: [
			{
				$lookup: {
					from: 			"corporations",
					localField: 	"corporation",
					foreignField: 	"id",
					as: 			"corporation"
				}
			},
			{
				$unwind: {
					path: 			"$corporation",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 			"alliances",
					localField: 	"corporation.alliance",
					foreignField: 	"id",
					as: 			"corporation.alliance"
				}
			},
			{
				$unwind: {
					path: 			"$corporation.alliance",
					preserveNullAndEmptyArrays: true
				}
			}
		]
	};
