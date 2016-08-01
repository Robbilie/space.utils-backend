
	"use strict";

	const PatchUtil 				= require("util/PatchUtil");

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

	}

	module.exports = Base;