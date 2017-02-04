
	"use strict";

	const { Base } 		= require("model/");
	const { Store } = require("store/");

	class List extends Base {

		constructor (type, future_data) {
			super(future_data.then(data => data.map(doc => Store.from_promise(doc, type))));
			this.type = type;
		}

		get_type () {
			return this.type;
		}

		get length () {
			return this.get_future().then(data => data.length);
		}

		toArray () {
			return this.get_future().then(arr => arr.map(el => new (this.get_type())(el)));
		}

		map (fn) {
			console.log(this.get_future(), this.get_future().then);
			return this.get_future().then(data => Promise.all(data.map(fn)));
		}

		async serialize (depth = 2) {
			let data = await this.get_future();
			return Promise.all(data.map(element => element.serialize(depth - 1)));
		}

	}

	module.exports = List;
