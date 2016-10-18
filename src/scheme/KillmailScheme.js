
	"use strict";

	const { ObjectId } = require("mongodb");

	module.exports = {
		types: {
			_id: 					ObjectId,
			killID: 				Number,
			hash: 					String,
			solarSystem: 			"System",
			killTime: 				String,
			attackers: 				"KillmailAttackerList",
			attackerCount: 			Number,
			victim: 				"KillmailVictim"
		},
		aggregations: [
			{
				$lookup: {
					from: 			"systems",
					localField: 	"solarSystemID",
					foreignField: 	"id",
					as: 			"solarSystem"
				}
			},
			{
				$unwind: {
					path: 			"$solarSystem",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 			"characters",
					localField: 	"victim.characterID",
					foreignField: 	"id",
					as: 			"victim.character"
				}
			},
			{
				$unwind: {
					path: 			"$victim.character",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 			"corporations",
					localField: 	"victim.corporationID",
					foreignField: 	"id",
					as: 			"victim.corporation"
				}
			},
			{
				$unwind: {
					path: 			"$victim.corporation",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 			"alliances",
					localField: 	"victim.allianceID",
					foreignField: 	"id",
					as: 			"victim.alliance"
				}
			},
			{
				$unwind: {
					path: 			"$victim.alliance",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 			"factions",
					localField: 	"victim.factionID",
					foreignField: 	"id",
					as: 			"victim.faction"
				}
			},
			{
				$unwind: {
					path: 			"$victim.faction",
					preserveNullAndEmptyArrays: true
				}
			}
		]
	};
