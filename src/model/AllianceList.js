
	"use strict";

	const { List, Alliance } = require("model/");

	class AllianceList extends List {

		constructor (data) {
			super(Alliance, data);
		}

	}

	module.exports = AllianceList;
