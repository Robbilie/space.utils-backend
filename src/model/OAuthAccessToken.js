
	"use strict";

	const Base 						= require("model/Base");
	const PatchUtil 				= require("util/PatchUtil");

	class OAuthAccessToken extends Base {

		getToken () {}

		getExpirationDate () {}

		getUserId () {}

		getClientId () {}

	}

	PatchUtil.model(OAuthAccessToken);

	module.exports = OAuthAccessToken;