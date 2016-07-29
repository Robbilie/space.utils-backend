
	"use strict";

	const PatchUtil 				= require("util/PatchUtil");

	class Base {

		constructor (data) {
			this.data = data;
		}

		get_id () {
			return this.data._id;
		}

	}

	module.exports = Base;