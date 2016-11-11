
	"use strict";

	const { List, Character } = require("model/");

	class CharacterList extends List {

		constructor (data) {
			super(Character, data);
		}

	}

	module.exports = CharacterList;
