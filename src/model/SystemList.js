
	"use strict";

	const { List, System } = require("model/");

	class SystemList extends List {

		constructor (future_data) {
			super(System, future_data);
		}

	}

	module.exports = SystemList;
