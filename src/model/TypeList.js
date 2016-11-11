
	"use strict";

	const { List, Type } = require("model/");

	class TypeList extends List {

		constructor (data) {
			super(Type, data);
		}

	}

	module.exports = TypeList;
