
	"use strict";

	const { List } = require("model/");

	class CorporationList extends List {

		constructor (data) {
			super("Corporation", data);
		}

	}

	module.exports = CorporationList;
