
	"use strict";

	const { IDStore } = require("store/");
	const { KillmailTask } = require("task/");

	class KillmailStore extends IDStore {

		static async find_or_create (killmail_id, killmail_hash, faf = false, {} = $(1, { killmail_id }, "Number")) {

			console.log("foc killmail", killmail_id, killmail_hash);

			let killmail = this.find_by_id(killmail_id, {}, faf);

			if(await killmail.is_null() === true && killmail_hash !== undefined)
				await KillmailTask.create({ killmail_id, killmail_hash }, faf);

			if (faf === true)
				return null;

			if (await killmail.is_null() === true)
				killmail = this.find_by_id(killmail_id);

			return killmail.get_future();

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
				localField: 	"attackers.character_id",
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
			$project: {
				"attackers.character.corporation_history": 0
			}
		},
		{
			$lookup: {
				from: 			"corporations",
				localField: 	"attackers.corporation_id",
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
			$project: {
				"attackers.corporation.alliance_history": 0
			}
		},
		{
			$lookup: {
				from: 			"alliances",
				localField: 	"attackers.alliance_id",
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
				localField: 	"attackers.faction_id",
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
				localField: 	"attackers.ship_type_id",
				foreignField: 	"id",
				as: 			"attackers.ship_type"
			}
		},
		{
			$unwind: {
				path: 			"$attackers.ship_type",
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$project: {
				"attackers.ship_type.dogma_attributes": 0,
				"attackers.ship_type.dogma_effects": 0
			}
		},
		{
			$lookup: {
				from: 			"types",
				localField: 	"attackers.weapon_type_id",
				foreignField: 	"id",
				as: 			"attackers.weapon_type"
			}
		},
		{
			$unwind: {
				path: 			"$attackers.weapon_type",
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$project: {
				"attackers.weapon_type.dogma_attributes": 0,
				"attackers.weapon_type.dogma_effects": 0
			}
		},
		{
			$group: {
				_id: "$_id",
				id: { $first: "$id" },
				hash: { $first: "$hash" },
				time: { $first: "$time"},
				attacker_count: { $first: "$attacker_count" },
				victim: { $first: "$victim" },
				solar_system_id: { $first: "$solar_system_id" },
				war_id: { $first: "$war_id" },
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
				localField: 	"victim.items.item_type_id",
				foreignField: 	"id",
				as: 			"victim.items.item_type"
			}
		},
		{
			$unwind: {
				path: 			"$victim.items.item_type",
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$project: {
				"victim.items.item_type.dogma_attributes": 0,
				"victim.items.item_type.dogma_effects": 0
			}
		},
		{
			$group: {
				_id: "$_id",
				id: { $first: "$id" },
				hash: { $first: "$hash" },
				time: { $first: "$time" },
				attacker_count: { $first: "$attacker_count" },
				victim: { $first: "$victim" },
				solar_system_id: { $first: "$solar_system_id" },
				war_id: { $first: "$war_id" },
				attackers: { $first: "$attackers" },
				items: { $push: "$victim.items" }
			}
		},
		{
			$project: {
				id: 1,
				hash: 1,
				time: 1,
				attacker_count: 1,
				solar_system_id: 1,
				war_id: 1,
				attackers: 1,
				victim: {
					damage_taken: 1,
					position: 1,
					character_id: 1,
					corporation_id: 1,
					alliance_id: 1,
					faction_id: 1,
					ship_type_id: 1,
					items: "$items"
				}
			}
		},
		// solarsystem
		{
			$lookup: {
				from: 			"systems",
				localField: 	"solar_system_id",
				foreignField: 	"id",
				as: 			"solar_system"
			}
		},
		{
			$unwind: {
				path: 			"$solar_system",
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$project: {
				"solar_system.planets": 0,
				"solar_system.stargates": 0
			}
		},
		// war
		{
			$lookup: {
				from: 			"wars",
				localField: 	"war_id",
				foreignField: 	"id",
				as: 			"war"
			}
		},
		{
			$unwind: {
				path: 			"$war",
				preserveNullAndEmptyArrays: true
			}
		},
		// victim
		{
			$lookup: {
				from: 			"characters",
				localField: 	"victim.character_id",
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
			$project: {
				"victim.character.corporation_history": 0
			}
		},
		{
			$lookup: {
				from: 			"corporations",
				localField: 	"victim.corporation_id",
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
			$project: {
				"victim.corporation.alliance_history": 0
			}
		},
		{
			$lookup: {
				from: 			"alliances",
				localField: 	"victim.alliance_id",
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
				localField: 	"victim.faction_id",
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
				localField: 	"victim.ship_type_id",
				foreignField: 	"id",
				as: 			"victim.ship_type"
			}
		},
		{
			$unwind: {
				path: 			"$victim.ship_type",
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$project: {
				"victim.ship_type.dogma_attributes": 0,
				"victim.ship_type.dogma_effects": 0
			}
		}
	];

	module.exports = KillmailStore;
