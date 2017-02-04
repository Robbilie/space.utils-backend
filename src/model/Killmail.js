
	"use strict";

	const { Base, List } = require("model/");

	class KillmailItem extends Base {

		serialize () {
			return super.serialize(1);
		}

	}

	class KillmailItemList extends List {

		constructor (future_data) {
			super(KillmailItem, future_data);
		}

	}

	class KillmailVictim extends Base {

		serialize () {
			return super.serialize(1);
		}

	}

	class KillmailAttacker extends Base {

		serialize () {
			return super.serialize(1);
		}

	}

	class KillmailAttackerList extends List {

		constructor (future_data) {
			super(KillmailAttacker, future_data);
		}

	}

	class Killmail extends Base {

		get_id () {}

	}

	module.exports = Killmail;

	/* TYPE DEFINITION */

	const { ObjectID } = require("mongodb");
	const { System, Type, Character, Corporation, Alliance, Faction } = require("model/");

	KillmailItem.types = {
		singleton: 				Number,
		flag: 					Number,
		quantity_destroyed: 	Number,
		quantity_dropped: 		Number,
		item_type: 				Type
	};

	KillmailItemList.types = {};

	KillmailVictim.types = {
		damage_taken: 	Number,
		position: 		Object,
		items: 			KillmailItemList,
		character: 		Character,
		corporation: 	Corporation,
		alliance: 		Alliance,
		faction: 		Faction,
		ship_type: 		Type,
		weapon_type: 	Type
	};

	KillmailAttacker.types = {
		final_blow: 			Boolean,
		security_status: 	Number,
		damage_done: 		Number,
		character: 			Character,
		corporation: 		Corporation,
		alliance: 			Alliance,
		faction: 			Faction,
		ship_type: 			Type,
		weapon_type: 		Type
	};

	KillmailAttackerList.types = {};

	Killmail.types = {
		_id: 				ObjectID,
		id: 				Number,
		hash: 				String,
		solar_system: 		System,
		killmail_time: 			Number,
		attackers: 			KillmailAttackerList,
		attacker_count: 	Number,
		victim: 			KillmailVictim
	};

	const { PatchUtil } = require("util/");

	PatchUtil.model(Killmail);
