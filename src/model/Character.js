
	"use strict";

	const { Entity } = require("model/");

	class Character extends Entity {

		get_corporation () {}

	}

	module.exports = Character;

	/* TYPE DEFINITION */

	const { Corporation, Alliance } = require("model/");

	Character.types = {
		id: 			Number,
		name: 			String,
		corporation: 	Corporation,
		alliance: 		Alliance
	};

	const { PatchUtil } = require("util/");

	PatchUtil.model(Character);
	