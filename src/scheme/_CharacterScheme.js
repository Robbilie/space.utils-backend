
	"use strict";

	const { _Corporation } = require("model");

	module.exports = {
		types: {
			id: 				Number,
			name: 				String,
			corporation: 		_Corporation
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
					path: 			"$alliance",
					preserveNullAndEmptyArrays: true
				}
			}
		]
	};
