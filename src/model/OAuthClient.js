
	"use strict";

	const Base 						= require("model/Base");
	const PatchUtil 				= require("util/PatchUtil");

	class OAuthClient extends Base {

		getSecret () {}

	}

	PatchUtil.model(OAuthClient);

	module.exports = OAuthClient;