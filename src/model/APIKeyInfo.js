
	"use strict";

	const { Base } 					= require("model/");
	const { PatchUtil } 			= require("util/");

	class APIKeyInfo extends Base {

		getKeyID () {}

		getCode () {}

		getAccessMask () {}

		getType () {}

		getExpires () {}

	}

	APIKeyInfo.types = {
		keyID: 			String,
		vCode: 			String,
		accessMask: 	Number,
		type: 			String,
		expires: 		Number
	};

	PatchUtil.model(APIKeyInfo);

	module.exports = APIKeyInfo;
