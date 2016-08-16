
	"use strict";

	const Base 						= require("model/Base");
	const PatchUtil 				= require("util/PatchUtil");

	class APIKeyInfo extends Base {

		getKeyId () {}

		getVCode () {}

		getAccessMask () {}

		getType () {}

		getExpires () {}

	}

	PatchUtil.model(APIKeyInfo);

	module.exports = APIKeyInfo;