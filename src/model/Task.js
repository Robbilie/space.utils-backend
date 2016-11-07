
	"use strict";

	const { ObjectId } 				= require("mongodb");
	const { Base } 					= require("model/");

	class Task extends Base {

		getInfo () {
			return this.getFuture().then(data => data["info"]);
		}

		getData () {
			return this.getFuture().then(data => data["data"]);
		}

	}

	Task.types = {
		_id: 	ObjectId,
		info: 	Object,
		data: 	Object
	};

	module.exports = Task;
	