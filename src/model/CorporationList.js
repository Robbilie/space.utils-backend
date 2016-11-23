
	"use strict";

	const { List, Corporation } = require("model/");

	class CorporationList extends List {

		constructor (future_data) {
			super(Corporation, future_data);
		}

	}

	module.exports = CorporationList;
