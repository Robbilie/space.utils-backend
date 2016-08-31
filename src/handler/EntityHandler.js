
	"use strict";

	const { DBUtil } = require("util/");

	class EntityHandler {

		static getStore () {
			return DBUtil.getStore(this.name.slice(0, -7));
		}

	}

	module.exports = EntityHandler;