
	"use strict";

	const Base 						= require("model/Base");
	const PatchUtil 				= require("util/PatchUtil");

	class OAuthAuthorizationCode extends Base {

		getToken () {}

		getRedirect () {}

		getScope () {}

		getCharacterId () {}

		getClientId () {}

	}

	PatchUtil.model(OAuthAuthorizationCode);

	module.exports = OAuthAuthorizationCode;