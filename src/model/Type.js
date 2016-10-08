
	"use strict";

	const { PatchUtil } 			= require("util/");
	const { Base } 					= require("model/");

	class Type extends Base {

		getId () {}

		getName () {}

	}

	PatchUtil.model(Type);

	module.exports = Type;
