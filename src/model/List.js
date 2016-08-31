
	"use strict";

	const { Base } = require("model/");

	class List extends Base {

		constructor (type, data) {
			super(data);
			this.type = type;
		}

		getType () {
			return this.type;
		}

		toJSON (depth = 2) {
			return this
				.getFuture()
				.then(arr => arr.map(el => new (this.getType())(el)))
				.then(arr => Promise.all(el => el.toJSON(depth - 1)));
		}

	}

	module.exports = List;