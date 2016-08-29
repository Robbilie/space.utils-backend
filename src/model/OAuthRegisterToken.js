
	"use strict";

	const { Base } 					= require("model");
	const { PatchUtil } 			= require("util");

	class OAuthRegisterToken extends Base {

		getToken () {}

		getUser () {}

		getExpirationDate () {}

	}

	PatchUtil.model(OAuthRegisterToken);

	module.exports = OAuthRegisterToken;
	