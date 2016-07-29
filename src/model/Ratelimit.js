
	"use strict";

	const Base 						= require("model/Base");
	const PatchUtil 				= require("util/PatchUtil");

	class Ratelimit extends Base {

		getType () {}

		getTimestamp () {}

	}

	PatchUtil.model(Ratelimit);

	module.exports = Ratelimit;