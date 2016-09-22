
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
			return Object.assign(data, { limit: req.body.options ? Math.min(req.body.options.limit || 250, 250) : 250 })
		}

	}

	module.exports = BaseHandler;