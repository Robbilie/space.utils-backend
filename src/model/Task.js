
	"use strict";

	const Base 						= require("model/Base");
	const PatchUtil 				= require("util/PatchUtil");

	class Task extends Base {

		getInfo () {}

		getData () {}

	}

	PatchUtil.model(Task);

	module.exports = Task;