
	"use strict";

	const { PatchUtil } 			= require("util");
	const { Store } 				= require("store");

	class UserStore extends Store {

		findByName () {}

	}

	PatchUtil.store(UserStore);

	module.exports = UserStore;
