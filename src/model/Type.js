
	"use strict";

	const { Base } 					= require("model/");

	class Type extends Base {

		get_id () {}

		get_name () {}

		get_description () {}

	}

	module.exports = Type;

	/* TYPE DEFINITION */

	Type.types = {
		id: 			Number,
		name: 			String,
		description: 	String
	};

	const { PatchUtil } = require("util/");

	PatchUtil.model(Type);
