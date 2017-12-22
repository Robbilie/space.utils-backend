
	"use strict";

	const { LoadUtil, PropertyWrap: { _ } } = require("util/");

	class Base {

		static create (...args) {
			return new this(...args);
		}

		static getStore () {
			return LoadUtil.store(this.name);
		}

		constructor (future) {
			this.future = future;
		}

		then (...args) {
			return this.getFuture().then(...args);
		}

		getFuture () {
			return this.future;
		}

		valueOf () {
			return this;
		}

		isNull () {
			return this.then(data => data === null);
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
