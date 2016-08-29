
	"use strict";

	const { Base } 						= require("model/");
	const { PatchUtil } 				= require("util/");

	class User extends Base {

		getName () {}

		getPassword () {}

		getCharacters () {}

	}

	PatchUtil.model(User);

	module.exports = User;
	