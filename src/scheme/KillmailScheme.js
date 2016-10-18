
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
			// attackers
			{
				$unwind: {
					path: 			"$attackers",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 			"characters",
					localField: 	"attackers.characterID",
					foreignField: 	"id",
					as: 			"attackers.character"
				}
			},
			{
				$unwind: {
					path: 			"$attackers.character",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 			"corporations",
					localField: 	"attackers.corporationID",
					foreignField: 	"id",
					as: 			"attackers.corporation"
				}
			},
			{
				$unwind: {
					path: 			"$attackers.corporation",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 			"alliances",
					localField: 	"attackers.allianceID",
					foreignField: 	"id",
					as: 			"attackers.alliance"
				}
			},
			{
				$unwind: {
					path: 			"$attackers.alliance",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 			"factions",
					localField: 	"attackers.factionID",
					foreignField: 	"id",
					as: 			"attackers.faction"
				}
			},
			{
				$unwind: {
					path: 			"$attackers.faction",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 			"types",
					localField: 	"attackers.shipTypeID",
					foreignField: 	"id",
					as: 			"attackers.shipType"
				}
			},
			{
				$unwind: {
					path: 			"$attackers.shipType",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 			"types",
					localField: 	"attackers.weaponTypeID",
					foreignField: 	"id",
					as: 			"attackers.weaponType"
				}
			},
			{
				$unwind: {
					path: 			"$attackers.weaponType",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$group: {
					_id: "$_id",
					killID: { $first: "$killID" },
					hash: { $first: "$hash" },
					killTime: { $first: "$killTime"},
					attackerCount: { $first: "$attackerCount" },
					victim: { $first: "$victim" },
					solarSystemID: { $first: "$solarSystemID" },
					warID: { $first: "$warID" },
					attackers: { $push: "$attackers" }
				}
			},
			// solarsystem
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
			// victim
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
			},
			{
				$lookup: {
					from: 			"types",
					localField: 	"victim.shipTypeID",
					foreignField: 	"id",
					as: 			"victim.shipType"
				}
			},
			{
				$unwind: {
					path: 			"$victim.shipType",
					preserveNullAndEmptyArrays: true
				}
			}
		]
	};
