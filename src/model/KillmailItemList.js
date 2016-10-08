
	"use strict";

	const { List } = require("model/");

	class KillmailItemList extends List {

		constructor (data) {
			super("KillmailItem", data);
		}

	}

	module.exports = KillmailItemList;
