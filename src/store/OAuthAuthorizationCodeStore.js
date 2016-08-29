
	"use strict";

	const { PatchUtil } 			= require("util");
	const { Store } 				= require("store");

	class OAuthAuthorizationCodeStore extends Store {

		findByToken () {}

	}

	PatchUtil.store(OAuthAuthorizationCodeStore);

	module.exports = OAuthAuthorizationCodeStore;
	