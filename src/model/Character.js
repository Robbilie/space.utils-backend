
	"use strict";

	const IdAndName 				= require("model/IdAndName");
	const PatchUtil 				= require("util/PatchUtil");

	class Character extends IdAndName {

		getCorporation () {}

	}

	PatchUtil.model(Character);
	
	module.exports = Character;