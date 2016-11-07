
	"use strict";

	const { ObjectId } 				= require("mongodb");
	const { Base } 					= require("model/");
	const { PatchUtil } 			= require("util/");

	class Mail extends Base {

	}

	Mail.types = {
		_id: 	ObjectId
	};

	PatchUtil.model(Mail);

	module.exports = Mail;
	