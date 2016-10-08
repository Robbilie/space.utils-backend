
	"use strict";

	const { List } = require("model/");

	class KillmailAttackerList extends List {

		constructor (data) {
			super("KillmailAttacker", data);
		}

	}

	module.exports = KillmailAttackerList;
