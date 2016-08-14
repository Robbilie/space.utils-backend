
	"use strict";

	const Base 						= require("model/Base");
	const PatchUtil 				= require("util/PatchUtil");

	class User extends Base {

		getName () {}

		getPassword () {}

	}

	PatchUtil.model(User);

	module.exports = User;