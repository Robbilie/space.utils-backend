
	"use strict";

	const { List, Type } = require("model/");

	class TypeList extends List {

		constructor (future_data) {
			super(Type, future_data);
		}

	}

	module.exports = TypeList;
