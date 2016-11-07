
	"use strict";

	const { Base } 					= require("model/");

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

	module.exports = KillmailAttacker;
