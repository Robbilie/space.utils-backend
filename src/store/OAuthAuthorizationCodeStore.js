
	"use strict";

	const PatchUtil 				= require("util/PatchUtil");
	const Store 					= require("store/Store");
	const Character 				= require("model/Character");
	const OAuthClient 				= require("model/OAuthClient");

	class OAuthAuthorizationCodeStore extends Store {

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

	}

	PatchUtil.store(OAuthAuthorizationCodeStore);

	module.exports = OAuthAuthorizationCodeStore;