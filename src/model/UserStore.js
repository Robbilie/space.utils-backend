
	"use strict";

	const PatchUtil 				= require("util/PatchUtil");
	const Store 					= require("store/Store");

	class UserStore extends Store {

		getByName () {}

	}

	PatchUtil.store(UserStore);

	module.exports = UserStore;