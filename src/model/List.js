
	"use strict";

	const { Base } 		= require("model/");
	const { Store } = require("store/");

	class List extends Base {

		constructor (type, future) {
			super(future);
			this.type = type;
		}

		get length () {
			return this.then(data => data.length);
		}

		toArray () {
			return this.future();
		}

		map (fn, bare = false) {
			return this.then(data => Promise.all(data.map(bare === false ? this.type.create : x => x).map(fn)));
		}

	}

	module.exports = List;
