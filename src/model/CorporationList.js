
	"use strict";

	const { List, Corporation } = require("model/");

	class CorporationList extends List {

		constructor (data) {
			super(Corporation, data);
		}

	}

	module.exports = CorporationList;
