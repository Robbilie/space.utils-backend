
	"use strict";

	const { Base } 					= require("model/");

	class KillmailItem extends Base {

		toJSON (depth = 2) {
			return this.constructor.toJSON(this.constructor.name, this.getFuture(), 1);
		}

	}

	module.exports = KillmailItem;
