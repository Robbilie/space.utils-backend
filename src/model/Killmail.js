
	"use strict";

	const { Base } 						= require("model/");
	const { PatchUtil } 				= require("util/");

	class Killmail extends Base {

		getKillID () {}

	}

	PatchUtil.model(Killmail);

	module.exports = Killmail;
