
	"use strict";
	
	const BaseTask 					= require("task/BaseTask");

	class XMLTask extends BaseTask {

		static getType () {
			return "XML";
		}

	};

	module.exports = XMLTask;