
	"use strict";

	const DBUtil 					= require("util/DBUtil");

	class Base {

		constructor (data) {
			this.data = data;
		}

		getData () {
			return this.data;
		}

		get_id () {
			return this.data._id;
		}

		getStore () {
			return DBUtil.getStore(this.constructor.name);
		}

		update (...args) {
			return this.getStore().then(store => store.update({ _id: this.get_id() }, ...args));
		}

		modify (...args) {
			return this.getStore().then(store => store.findAndModify({ _id: this.get_id() }, ...args));
		}

	}

	module.exports = Base;