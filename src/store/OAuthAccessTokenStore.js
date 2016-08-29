
	"use strict";

	const { PatchUtil } 			= require("util/");
	const { Store } 				= require("store/");

	class OAuthAccessTokenStore extends Store {

		findByToken () {}

		removeExpired () {
			return this.destroy({ expirationDate: { $lt: Date.now() } });
		}

	}

	PatchUtil.store(OAuthAccessTokenStore);

	module.exports = OAuthAccessTokenStore;
