
	"use strict";

	const { Base } 					= require("model/");

	class KillmailVictim extends Base {

		toJSON (depth = 1) {
			return this.constructor.toJSON(this.constructor.name, this.getFuture(), depth);
		}

	}

	KillmailVictim.types = {
		damageTaken: 	Number,
		position: 		Object,
		items: 			"KillmailItemList",
		character: 		"Character",
		corporation: 	"Corporation",
		alliance: 		"Alliance",
		faction: 		"Faction",
		shipType: 		"Type",
		weaponType: 	"Type"
	};

	module.exports = KillmailVictim;
