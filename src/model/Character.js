
	"use strict";

	const { PatchUtil } 	= require("util/");
	const { Entity } 		= require("model/");

	class Character extends Entity {

		getCorporation () {}

	}

	Character.types = {
		id: 			Number,
		name: 			String,
		corporation: 	"Corporation",
		updated: 		Number
	};

	PatchUtil.model(Character);

	module.exports = Character;
	