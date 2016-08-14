
	"use strict";

	const Base 						= require("model/Base");
	const PatchUtil 				= require("util/PatchUtil");

	class OAuthAuthorizationCode extends Base {

		getToken () {}

		getRedirect () {}

		getScope () {}

		getUserId () {}

		getClientId () {}

	}

	PatchUtil.model(OAuthAuthorizationCode);

	module.exports = OAuthAuthorizationCode;