
	"use strict";

	const { Base, List } = require("model/");

	class WarAggressor extends Base {}

	class WarDefender extends Base {}

	class WarAlly extends Base {}

	class WarAllyList extends List {

		constructor (future_data) {
			super(WarAlly, future_data);
		}

	}

	class War extends Base {

		get_id () {}

	}

	module.exports = War;

	/* TYPE DEFINITION */

	const { Corporation, Alliance } = require("model/");

	WarAggressor.types = {
		ships_killed: 		Number,
		isk_destroyed: 		Number,
		corporation: 		Corporation,
		alliance: 			Alliance
	};

	WarDefender.types = {
		ships_killed: 		Number,
		isk_destroyed: 		Number,
		corporation: 		Corporation,
		alliance: 			Alliance
	};

	WarAlly.types = {
		corporation: 		Corporation,
		alliance: 			Alliance
	};

	WarAllyList.types = {};

	War.types = {
		id: 				Number,
		declared: 			Number,
		starter: 			Number,
		finished: 			Number,
		mutal: 				Boolean,
		open_for_allies: 	Boolean,
		aggressor: 			WarAggressor,
		defender: 			WarDefender,
		allies: 			WarAllyList
	};

	const { PatchUtil } = require("util/");

	PatchUtil.model(War);
