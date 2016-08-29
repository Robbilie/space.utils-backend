
	"use strict";

	const { Base } 					= require("model");
	const { PatchUtil } 			= require("util");

	class OAuthRefreshToken extends Base {

		getToken () {}

		getExpirationDate () {}

		getCharacter () {}

		getClient () {}

		getScope () {}

	}

	PatchUtil.model(OAuthRefreshToken);

	module.exports = OAuthRefreshToken;
	