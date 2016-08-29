
	"use strict";

	const { Base } 					= require("model");
	const { PatchUtil } 			= require("util");

	class APIKeyInfo extends Base {

		getKeyID () {}

		getCode () {}

		getAccessMask () {}

		getType () {}

		getExpires () {}

	}

	PatchUtil.model(APIKeyInfo);

	module.exports = APIKeyInfo;
