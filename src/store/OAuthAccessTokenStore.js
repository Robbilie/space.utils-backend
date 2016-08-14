
	"use strict";

	const PatchUtil 				= require("util/PatchUtil");
	const Store 					= require("store/Store");

	class OAuthAccessTokenStore extends Store {

		getByToken () {}

		removeExpired () {
			return this.destroy({ expirationDate: { $lt: Date.now() } });
		}

	}

	PatchUtil.store(OAuthAccessTokenStore, ["removeExpired"]);

	module.exports = OAuthAccessTokenStore;