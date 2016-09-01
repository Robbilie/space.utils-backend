
	"use strict";

	const { Character, List } = require("model/");

	class CharacterList extends List {

		constructor (data) {
			super(Character, data);
		}

	}

	module.exports = CharacterList;
