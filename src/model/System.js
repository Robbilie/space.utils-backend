
	"use strict";

	const { PatchUtil } 			= require("util/");
	const { Base } 					= require("model/");

	class System extends Base {

		getId () {}

		getName () {}

	}

	System.types = {
		id: 				Number,
		name: 				String,
		securityStatus: 	Number
	};

	PatchUtil.model(System);

	module.exports = System;
