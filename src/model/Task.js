
	"use strict";

	const { Base } 					= require("model");
	const { PatchUtil } 			= require("util");

	class Task extends Base {

		getInfo () {}

		getData () {}

	}

	PatchUtil.model(Task);

	module.exports = Task;
	