
	"use strict";

	const { DBUtil } = require("util/");

	class BaseHandler {

		static getStore () {
			return DBUtil.getStore(this.name.slice(0, -7));
		}

	}

	module.exports = BaseHandler;