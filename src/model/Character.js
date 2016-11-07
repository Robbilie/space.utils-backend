
	"use strict";

	const { PatchUtil } 	= require("util/");
	const { Entity } 		= require("model/");

	class Character extends Entity {

		getCorporation () {}

	}

	Character.types = {
		id: 			Number,
		name: 			String,
		corporation: 	"Corporation",
		updated: 		Number
	};
	Character.aggregations = [
		{
			$lookup: {
				from: 			"corporations",
				localField: 	"corporationID",
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
				localField: 	"corporation.allianceID",
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
	];

	PatchUtil.model(Character);

	module.exports = Character;
	