
	"use strict";

	const { BaseTask } 		= require("task/");

	class FactionTask extends BaseTask {

		async start () {
			console.log("FACTION TASK WHERE DOES THIS COME FROM");
		}

	}

	module.exports = FactionTask;
