
	"use strict";

	const { PatchUtil } 	= require("util");
	const { Entity } 		= require("model");

	class Corporation extends Entity {

		getCeo () {}

		getAlliance () {}

	}

	PatchUtil.model(Corporation);

	module.exports = Corporation;
	