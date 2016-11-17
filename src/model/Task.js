
	"use strict";

	const { Base } 					= require("model/");

	class Task extends Base {

		get_info () {
			return this.get_future().then(data => data["info"]);
		}

		get_data () {
			return this.get_future().then(data => data["data"]);
		}

	}

	module.exports = Task;

	/* TYPE DEFINITION */

	const { ObjectID } = require("mongodb");

	Task.types = {
		_id: 	ObjectID,
		info: 	Object,
		data: 	Object
	};
	