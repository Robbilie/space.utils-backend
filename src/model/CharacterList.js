
	"use strict";

	const { List, Character } = require("model/");

	class CharacterList extends List {

		constructor (future_data) {
			super(Character, future_data);
		}

	}

	module.exports = CharacterList;
