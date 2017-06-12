
	"use strict";

	const { LoadUtil, PropertyWrap: { _ } } = require("util/");

	class Base {

		static create (...args) {
			return new this(...args);
		}

		static store () {
			return LoadUtil.store(this.name);
		}

		constructor (future) {
			this.future = future;
		}

		then (...args) {
			return this.future().then(...args);
		}

		future () {
			return this.future;
		}

		valueOf () {
			return this;
		}

		is_null () {
			return this.then(data => !data);
		}

		get__id () {
			return this.then(({ _id }) => _id);
		}

	}

	module.exports = Base;

	/* TYPE DEFINITION */

	const { ObjectID } = require("mongodb");

	Base.types = {
		_id: ObjectID
	};
