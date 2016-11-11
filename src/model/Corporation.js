
	"use strict";

	const { PatchUtil } 	= require("util/");
	const { Entity } 		= require("model/");

	class Corporation extends Entity {

		getCeo () {}

		getAlliance () {}

	}

	Corporation.types = {
		id: 			Number,
		name: 			String,
		ticker: 		String,
		description: 	String,
		ceo: 			"Character",
		alliance: 		"Alliance",
		updated: 		Number
	};

	PatchUtil.model(Corporation);

	module.exports = Corporation;
	