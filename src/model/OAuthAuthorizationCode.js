
	"use strict";

	const { Base } 					= require("model");
	const { PatchUtil } 			= require("util");

	class OAuthAuthorizationCode extends Base {

		getToken () {}

		getRedirect () {}

		getScope () {}

		getCharacter () {}

		getClient () {}

	}

	PatchUtil.model(OAuthAuthorizationCode);

	module.exports = OAuthAuthorizationCode;
	