
	"use strict";

	const { Base } 		= require("model/");
	const { Store } = require("store/");

	class List extends Base {

		constructor (type, future_data) {
			super(future_data);
			this.type = type;
		}

		get_future () {
			if (this.list === undefined)
				this.list = this.get_raw().then(data => data.map(doc => Store.from_data(doc, type)));
			return this.list;
		}

		get_type () {
			return this.type;
		}

		get length () {
			return this.get_future().then(data => data.length);
		}

		toArray () {
			return this.get_future();//.then(arr => arr.map(el => new (this.get_type())(el)));
		}

		map (fn, bare = false) {
			return this[bare === true ? "get_raw" : "get_future"]().then(data => Promise.all(data.map(fn)));
		}

		async serialize (depth = 2) {
			return await this.get_raw();
			let data = await this.get_future();
			return Promise.all(data.map(element => element.serialize(depth - 1)));
		}

	}

	module.exports = List;
