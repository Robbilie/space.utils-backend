
	"use strict";

	class InputUtil {

		static sanitize (data = {}) {
			return Object.entries(data).filter(([key, value]) => ["$where", "$regex", "lookup"].indexOf(key) === -1).reduce((p, [key, value]) => !(p[key] = value || true) || p, {})
		}

		static limit (data = {}) {
			return Object.assign(data, { limit: data.limit ? Math.min(data.limit, 250) : 250 })
		}

	}

	module.exports = InputUtil;
