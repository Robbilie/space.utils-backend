
	"use strict";

	const { List, Killmail } = require("model/");

	class KillmailList extends List {

		constructor (data) {
			super(Killmail, data);
		}

	}

	module.exports = KillmailList;
