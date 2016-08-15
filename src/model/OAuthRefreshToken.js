
	"use strict";

	const Base 						= require("model/Base");
	const PatchUtil 				= require("util/PatchUtil");

	class OAuthRefreshToken extends Base {

		getToken () {}

		getExpirationDate () {}

		getCharacterId () {}

		getClientId () {}

		getScope () {}

	}

	PatchUtil.model(OAuthRefreshToken);

	module.exports = OAuthRefreshToken;