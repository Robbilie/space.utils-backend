
	"use strict";

	const { Base } 					= require("model");
	const { PatchUtil } 			= require("util");

	class OAuthClient extends Base {

		getName () {}

		getSecret () {}

		getRedirect () {}

		getTrusted () {}

		getScope () {}

	}

	PatchUtil.model(OAuthClient);

	module.exports = OAuthClient;
	