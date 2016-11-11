
	"use strict";

	const { Base } 					= require("model/");

	class System extends Base {

		get_id () {}

		get_name () {}

	}

	module.exports = System;

	/* TYPE DEFINITION */

	System.types = {
		id: 				Number,
		name: 				String,
		securityStatus: 	Number
	};

	const { PatchUtil } = require("util/");

	PatchUtil.model(System);
