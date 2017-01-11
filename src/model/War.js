
	"use strict";

	const { Base } 					= require("model/");

	class WarAggressor extends Base {}

	class WarDefender extends Base {}

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

	War.types = {
		id: 				Number,
		declared: 			Number,
		starter: 			Number,
		finished: 			Number,
		mutal: 				Boolean,
		open_for_allies: 	Boolean,
		aggressor: 			WarAggressor,
		defender: 			WarDefender
	};

	const { PatchUtil } = require("util/");

	PatchUtil.model(War);
