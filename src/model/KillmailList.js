
	"use strict";

	const { List, Killmail } = require("model/");

	class KillmailList extends List {

		constructor (future_data) {
			super(Killmail, future_data);
		}

	}

	module.exports = KillmailList;
