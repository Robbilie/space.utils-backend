
	"use strict";

	const { PatchUtil } 	= require("util/");
	const { Entity } 		= require("model/");

	class Corporation extends Entity {

		getCeo () {}

		getAlliance () {}

	}

	Corporation.types = {
		id: 			Number,
		name: 			String,
		ticker: 		String,
		description: 	String,
		ceo: 			"Character",
		alliance: 		"Alliance",
		updated: 		Number
	};
	Corporation.aggregations = [
		{
			$lookup: {
				from: 			"alliances",
				localField: 	"allianceID",
				foreignField: 	"id",
				as: 			"alliance"
			}
		},
		{
			$unwind: {
				path: 			"$alliance",
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$lookup: {
				from: 			"characters",
				localField: 	"ceoID",
				foreignField: 	"id",
				as: 			"ceo"
			}
		},
		{
			$unwind: {
				path: 			"$ceo",
				preserveNullAndEmptyArrays: true
			}
		}
	];

	PatchUtil.model(Corporation);

	module.exports = Corporation;
	