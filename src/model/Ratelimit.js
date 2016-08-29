
	"use strict";

	const { Base } 					= require("model");
	const { PatchUtil } 			= require("util");

	class Ratelimit extends Base {

		getType () {}

		getTimestamp () {}

	}

	PatchUtil.model(Ratelimit);

	module.exports = Ratelimit;
	