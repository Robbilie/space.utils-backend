
	"use strict";

	const { DBUtil } 	= require("util/");
	const config 		= require("util/../../config/");

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

		static home () {
			return async (req, res) => res.json({
				characters: {
					href: `${config.site.url}/characters/`
				},
				corporations: {
					href: `${config.site.url}/corporations/`
				},
				alliances: {
					href: `${config.site.url}/alliances/`
				},
				killmails: {
					href: `${config.site.url}/killmails/`
				},
				systems: {
					href: `${config.site.url}/systems/`
				},
				types: {
					href: `${config.site.url}/types/`
				}
			});
		}

	}

	module.exports = BaseHandler;
