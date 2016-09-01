
	"use strict";

	const { List } = require("model/");

	class CharacterList extends List {

		constructor (data) {
			super("Character", data);
		}

	}

	module.exports = CharacterList;
