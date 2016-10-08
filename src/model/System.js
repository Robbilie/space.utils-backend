
	"use strict";

	const { PatchUtil } 			= require("util/");
	const { Base } 					= require("model/");

	class System extends Base {

		getId () {}

		getName () {}

	}

	PatchUtil.model(System);

	module.exports = System;
