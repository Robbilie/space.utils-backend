
	"use strict";

	const { List, Faction } = require("model/");

	class FactionList extends List {

		constructor (future_data) {
			super(Faction, future_data);
		}

	}

	module.exports = FactionList;
