
	"use strict";

	const { PatchUtil } 			= require("util/");
	const { Base } 					= require("model/");

	class Type extends Base {

		getId () {}

		getName () {}

	}

	Type.types = {
		id: 			Number,
		name: 			String,
		description: 	String
	};

	PatchUtil.model(Type);

	module.exports = Type;
