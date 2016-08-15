
	"use strict";

	const Base 						= require("model/Base");
	const PatchUtil 				= require("util/PatchUtil");

	class User extends Base {

		getName () {}

		getPassword () {}

		getCharacters () {}

	}

	PatchUtil.model(User);

	module.exports = User;