
	"use strict";

	const PatchUtil 				= require("util/PatchUtil");
	const Store 					= require("store/Store");

	class OAuthRegisterTokenStore extends Store {

		getByToken () {}

		getByUserId () {}

		removeExpired () {
			return this.destroy({ expirationDate: { $lt: Date.now() } });
		}

	}

	PatchUtil.store(OAuthRegisterTokenStore, ["removeExpired"]);

	module.exports = OAuthRegisterTokenStore;