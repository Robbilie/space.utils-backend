
	"use strict";

	const Base 						= require("model/Base");
	const PatchUtil 				= require("util/PatchUtil");

	class IdAndName extends Base {

		getId () {}

		getName () {}

	}

	PatchUtil.model(IdAndName);

	module.exports = IdAndName;