
	"use strict";

	const { Base } 		= require("model/");
	const { LoadUtil } 	= require("util/");

	class List extends Base {

		constructor (type, data) {
			super(data);
			this.type = type;
		}

		getType () {
			return LoadUtil.model(this.type);
		}

		get length () {
			return this.getFuture().then(data => data.length);
		}

		/* shouldnt work */
		map (fn) {
			return Promise.all(this.getFuture().then(data => data.map(fn)));
		}

		toJSON (depth = 2) {
			return this
				.getFuture()
				.then(arr => arr.map(el => new (this.getType())(el)))
				.then(arr => Promise.all(arr.map(el => el.toJSON(depth - 1))));
		}

	}

	module.exports = List;
