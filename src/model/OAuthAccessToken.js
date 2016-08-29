
	"use strict";

	const { Base } 					= require("model/");
	const { PatchUtil } 			= require("util/");

	class OAuthAccessToken extends Base {

		getToken () {}

		getExpirationDate () {}

		getCharacter () {}

		getClient () {}

	}

	PatchUtil.model(OAuthAccessToken);

	module.exports = OAuthAccessToken;
	