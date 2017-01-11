
	"use strict";

	const { Base } 					= require("model/");

	class WarAggressor extends Base {}

	class WarDefender extends Base {}

	class War extends Base {

		get_id () {}

	}

	module.exports = War;

	/* TYPE DEFINITION */

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
