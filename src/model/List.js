
	"use strict";

	const { Base } 		= require("model/");

	class List extends Base {

		constructor (type, data) {
			super(data);
			this.type = type;
		}

		get_type () {
			return this.type;
		}

		get length () {
			return this.getFuture().then(data => data.length);
		}

		toArray () {
			return this.getFuture().then(arr => arr.map(el => new (this.get_type())(el)));
		}

		map (fn) {
			return this.getFuture().then(data => Promise.all(data.map(fn)));
		}

		async serialize (depth = 2) {
			const data = await this.get_future();
			return Promise.all(data.map(element => element.serialize(depth - 1)));
		}

	}

	module.exports = List;
