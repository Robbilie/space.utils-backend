
	"use strict";

	const { PatchUtil } 			= require("util/");
	const { Store } 				= require("store/");

	class OAuthRegisterTokenStore extends Store {

		findByToken () {}

		findByUser () {}

		removeExpired () {
			return this.destroy({ expirationDate: { $lt: Date.now() } });
		}

	}

	PatchUtil.store(OAuthRegisterTokenStore);

	module.exports = OAuthRegisterTokenStore;
