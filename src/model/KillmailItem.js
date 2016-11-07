
	"use strict";

	const { Base } 					= require("model/");

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

	module.exports = KillmailItem;
