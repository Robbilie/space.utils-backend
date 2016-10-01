
	"use strict";

	const { Base } 					= require("model/");

	class Task extends Base {

		getInfo () {
			return this.getFuture().then(data => data["info"]);
		}

		getData () {
			return this.getFuture().then(data => data["data"]);
		}

	}

	module.exports = Task;
	