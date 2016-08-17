
	"use strict";

	const PatchUtil 				= require("util/PatchUtil");
	const Store 					= require("store/Store");

	class OAuthRegisterTokenStore extends Store {

		aggregate (data, lookups = ["user"]) {
			return super.aggregate(data, lookups);
		}

		getByToken () {}

		getByUser () {}

		removeExpired () {
			return this.destroy({ expirationDate: { $lt: Date.now() } });
		}

	}

	PatchUtil.store(OAuthRegisterTokenStore, ["removeExpired"]);

	module.exports = OAuthRegisterTokenStore;