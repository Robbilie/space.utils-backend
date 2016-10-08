
	"use strict";

	const { Base } 					= require("model/");

	class KillmailItem extends Base {

		toJSON (depth = 1) {
			return this.constructor.toJSON(this.constructor.name, this.getFuture(), depth);
		}

	}

	module.exports = KillmailItem;
