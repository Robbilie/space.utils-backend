
	"use strict";

	const PatchUtil 				= require("util/PatchUtil");
	const Store 					= require("store/Store");

	class OAuthRefreshTokenStore extends Store {

		getByToken () {}

	}

	PatchUtil.store(OAuthRefreshTokenStore);

	module.exports = OAuthRefreshTokenStore;