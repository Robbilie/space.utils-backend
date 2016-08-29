
	"use strict";

	const { PatchUtil } 			= require("util");
	const { Store } 				= require("store");

	class OAuthRefreshTokenStore extends Store {

		findByToken () {}

	}

	PatchUtil.store(OAuthRefreshTokenStore);

	module.exports = OAuthRefreshTokenStore;
	