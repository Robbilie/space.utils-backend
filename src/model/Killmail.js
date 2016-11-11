
	"use strict";

	const { ObjectId } 					= require("mongodb");
	const { Base } 						= require("model/");
	const { List } 						= require("model/");

	class KillmailItem extends Base {

		toJSON (depth = 2) {
			return this.constructor.toJSON(this.constructor.name, this.getFuture(), 1);
		}

	}

	KillmailItem.types = {
		singleton: 				Number,
		flag: 					Number,
		quantityDestroyed: 		Number,
		quantityDropped: 		Number,
		itemType: 				"Type"
	};

	class KillmailItemList extends List {

		constructor (data) {
			super(KillmailItem, data);
		}

	}

	class KillmailVictim extends Base {

		toJSON (depth = 1) {
			return this.constructor.toJSON(this.constructor.name, this.getFuture(), depth);
		}

	}

	KillmailVictim.types = {
		damageTaken: 	Number,
		position: 		Object,
		items: 			KillmailItemList,
		character: 		"Character",
		corporation: 	"Corporation",
		alliance: 		"Alliance",
		faction: 		"Faction",
		shipType: 		"Type",
		weaponType: 	"Type"
	};

	class KillmailAttacker extends Base {

		toJSON (depth = 2) {
			return this.constructor.toJSON(this.constructor.name, this.getFuture(), 1);
		}

	}

	KillmailAttacker.types = {
		finalBlow: 			Boolean,
		securityStatus: 	Number,
		damageDone: 		Number,
		character: 			"Character",
		corporation: 		"Corporation",
		alliance: 			"Alliance",
		faction: 			"Faction",
		shipType: 			"Type",
		weaponType: 		"Type"
	};

	class KillmailAttackerList extends List {

		constructor (data) {
			super(KillmailAttacker, data);
		}

	}

	Killmail.types = {
		_id: 				ObjectId,
		killID: 			Number,
		hash: 				String,
		solarSystem: 		"System",
		killTime: 			Number,
		attackers: 			KillmailAttackerList,
		attackerCount: 		Number,
		victim: 			KillmailVictim
	};

	PatchUtil.model(Killmail);

	module.exports = Killmail;
