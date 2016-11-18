
	"use strict";

	const { Base, List } = require("model/");

	class KillmailItem extends Base {

		serialize () {
			return super.serialize(1);
		}

	}

	class KillmailItemList extends List {

		constructor (data) {
			super(KillmailItem, data);
		}

	}

	class KillmailVictim extends Base {

	}

	class KillmailAttacker extends Base {

		serialize () {
			return super.serialize(1);
		}

	}

	class KillmailAttackerList extends List {

		constructor (data) {
			super(KillmailAttacker, data);
		}

	}

	class Killmail extends Base {

	}

	module.exports = Killmail;

	/* TYPE DEFINITION */

	const { ObjectID } = require("mongodb");
	const { System, Type, Character, Corporation, Alliance, Faction } = require("model/");

	KillmailItem.types = {
		singleton: 				Number,
		flag: 					Number,
		quantityDestroyed: 		Number,
		quantityDropped: 		Number,
		itemType: 				Type
	};

	KillmailVictim.types = {
		damageTaken: 	Number,
		position: 		Object,
		items: 			KillmailItemList,
		character: 		Character,
		corporation: 	Corporation,
		alliance: 		Alliance,
		faction: 		Faction,
		shipType: 		Type,
		weaponType: 	Type
	};

	KillmailAttacker.types = {
		finalBlow: 			Boolean,
		securityStatus: 	Number,
		damageDone: 		Number,
		character: 			Character,
		corporation: 		Corporation,
		alliance: 			Alliance,
		faction: 			Faction,
		shipType: 			Type,
		weaponType: 		Type
	};

	Killmail.types = {
		_id: 				ObjectID,
		killID: 			Number,
		hash: 				String,
		solarSystem: 		System,
		killTime: 			Number,
		attackers: 			KillmailAttackerList,
		attackerCount: 		Number,
		victim: 			KillmailVictim
	};

	const { PatchUtil } = require("util/");

	PatchUtil.model(Killmail);
