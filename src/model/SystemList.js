
	"use strict";

	const { List, System } = require("model/");

	class SystemList extends List {

		constructor (data) {
			super(System, data);
		}

	}

	module.exports = SystemList;
