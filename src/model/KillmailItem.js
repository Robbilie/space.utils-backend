
	"use strict";

	const { Base } 					= require("model/");

	class KillmailItem extends Base {

		toJSON (depth = 1) {
			return Base.toJSON(this.constructor.name, this.getFuture(), depth);
		}

	}

	module.exports = KillmailItem;
