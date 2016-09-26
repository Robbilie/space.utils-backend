
	"use strict";

	const { DBUtil } = require("util/");

	class BaseHandler {

		static getStore () {
			return DBUtil.getStore(this.name.slice(0, -7));
		}

		static sanitize (data = {}) {
			return Object.entries(data).filter(([key, value]) => ["$where", "$regex", "lookup"].indexOf(key) === -1).reduce((p, [key, value]) => !(p[key] = value || true) || p, {})
		}

		static limit (data = {}) {
			return Object.assign(data, { limit: data.limit ? Math.min(data.limit, 250) : 250 })
		}

	}

	module.exports = BaseHandler;