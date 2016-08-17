
	"use strict";

	const Base 						= require("model/Base");
	const PatchUtil 				= require("util/PatchUtil");

	class OAuthRegisterToken extends Base {

		getToken () {}

		getUser () {}

		getExpirationDate () {}

	}

	PatchUtil.model(OAuthRegisterToken);

	module.exports = OAuthRegisterToken;