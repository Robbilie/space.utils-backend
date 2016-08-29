
	"use strict";

	const { PatchUtil } 	= require("util/");
	const { Entity } 		= require("model/");

	class Character extends Entity {

		getCorporation () {}

	}

	PatchUtil.model(Character);

	module.exports = Character;
	