
	"use strict";

	const Base 						= require("model/Base");
	const PatchUtil 				= require("util/PatchUtil");

	class OAuthClient extends Base {

		getName () {}

		getSecret () {}

		getRedirect () {}

		getTrusted () {}

		getScope () {}

	}

	PatchUtil.model(OAuthClient);

	module.exports = OAuthClient;