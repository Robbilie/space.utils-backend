
	"use strict";

	const { Base } 					= require("model");
	const { PatchUtil } 			= require("util");

	class Mail extends Base {

	}

	PatchUtil.model(Mail);

	module.exports = Mail;
	