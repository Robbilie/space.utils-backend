
	"use strict";

	const { Store } = require("store/");
	const { KillmailTask } = require("task/");

	class KillmailStore extends Store {

		static async find_or_create (killmail_id, hash, {} = $(1, { killmail_id }, "Number")) {
			try {

				let killmail = await this.find_by_id(killmail_id);

				if(await killmail.is_null())
					await KillmailTask.create({ killmail_id, hash });

				killmail = await this.find_by_id(killmail_id);

				return killmail.get_future();

			} catch (e) { console.log(e, new Error()); }
		}

		static find_by_id (killID, {} = $(1, { killID }, "Number")) {
			return this.findOne({ killID });
		}

		static get_pk () {
			return "killID";
		}

		static find_by_pk (...keys) {
			return this.from_promise(this.find_or_create(...keys));
		}

	}

	KillmailStore.aggregations = [
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
		// victim items
		{
			$unwind: {
				path: "$victim.items",
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$lookup: {
				from: 			"types",
				localField: 	"victim.items.itemTypeID",
				foreignField: 	"id",
				as: 			"victim.items.itemType"
			}
		},
		{
			$unwind: {
				path: 			"$victim.items.itemType",
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$group: {
				_id: "$_id",
				killID: { $first: "$killID" },
				hash: { $first: "$hash" },
				killTime: { $first: "$killTime" },
				attackerCount: { $first: "$attackerCount" },
				victim: { $first: "$victim" },
				solarSystemID: { $first: "$solarSystemID" },
				warID: { $first: "$warID" },
				attackers: { $first: "$attackers" },
				items: { $push: "$victim.items" }
			}
		},
		{
			$project: {
				killID: 1,
				hash: 1,
				killTime: 1,
				attackerCount: 1,
				solarSystemID: 1,
				warID: 1,
				attackers: 1,
				victim: {
					damageTaken: 1,
					position: 1,
					characterID: 1,
					corporationID: 1,
					allianceID: 1,
					factionID: 1,
					shipTypeID: 1,
					items: "$items"
				}
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
	];

	module.exports = KillmailStore;
