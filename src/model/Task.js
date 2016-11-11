
	"use strict";

	const { Base } 					= require("model/");

	class Task extends Base {

		get_info () {
			return this.getFuture().then(data => data["info"]);
		}

		get_data () {
			return this.getFuture().then(data => data["data"]);
		}

	}

	module.exports = Task;

	/* TYPE DEFINITION */

	const { ObjectId } = require("mongodb");

	Task.types = {
		_id: 	ObjectId,
		info: 	Object,
		data: 	Object
	};
	