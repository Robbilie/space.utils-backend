
	"use strict";

	const { List, Faction } = require("model/");

	class FactionList extends List {

		constructor (data) {
			super(Faction, data);
		}

	}

	module.exports = FactionList;
