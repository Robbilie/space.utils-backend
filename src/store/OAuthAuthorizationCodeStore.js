
	"use strict";

	const PatchUtil 				= require("util/PatchUtil");
	const Store 					= require("store/Store");

	class OAuthAuthorizationCodeStore extends Store {

		getByToken () {}

	}

	PatchUtil.store(OAuthAuthorizationCodeStore);

	module.exports = OAuthAuthorizationCodeStore;