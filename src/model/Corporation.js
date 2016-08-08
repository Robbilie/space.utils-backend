
	"use strict";

	const IdAndName 				= require("model/IdAndName");
	const PatchUtil 				= require("util/PatchUtil");

	class Corporation extends IdAndName {

		getAlliance () {}

		getCeo () {}

	}
	
	PatchUtil.model(Corporation, [], { Ceo: "Character" });

	module.exports = Corporation;