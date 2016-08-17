
	"use strict";

	const PatchUtil 				= require("util/PatchUtil");
	const Store 					= require("store/Store");
	const Character 				= require("model/Character");
	const OAuthClient 				= require("model/OAuthClient");

	class OAuthAccessTokenStore extends Store {

		aggregate (data, lookups = ["character", { from: "oauthclients", localField: "client" }]) {
			return super.aggregate(
				data,
				lookups,
				doc => Object.assign(
					doc,
					{
						client: new OAuthClient(doc.client)
					}
				)
			);
		}

		getByToken () {}

		removeExpired () {
			return this.destroy({ expirationDate: { $lt: Date.now() } });
		}

	}

	PatchUtil.store(OAuthAccessTokenStore, ["removeExpired"]);

	module.exports = OAuthAccessTokenStore;