
	"use strict";

	const IdAndName 				= require("model/IdAndName");
	const PatchUtil 				= require("util/PatchUtil");

	class Corporation extends IdAndName {

		getAlliance () {}

	}
	
	PatchUtil.model(Corporation);

	module.exports = Corporation;