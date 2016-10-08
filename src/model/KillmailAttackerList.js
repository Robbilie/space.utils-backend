
	"use strict";

	const { List } = require("model/");

	class KillmailAttackerList extends List {

		constructor (data) {
			super("KillmailAttacker", data);
		}

		toJSON (depth = 1) {
			return Base.toJSON(this.constructor.name, this.getFuture(), depth);
		}

	}

	module.exports = KillmailAttackerList;
