
	"use strict";

	const { Entity } 		= require("model/");

	class Corporation extends Entity {

		get_ceo () {}

		get_alliance () {}

	}

	module.exports = Corporation;

	/* TYPE DEFINITION */

	const { Character, Alliance } = require("model/");

	Corporation.types = {
		id: 			Number,
		name: 			String,
		ticker: 		String,
		description: 	String,
		ceo: 			Character,
		alliance: 		Alliance,
		updated: 		Number
	};

	const { PatchUtil } 	= require("util/");

	PatchUtil.model(Corporation);
	