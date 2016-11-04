
	"use strict";

	const { BaseHandler } = require("handler/");

	class RootHandler extends BaseHandler {

		static home () {
			return async (req, res) => res.json(
				[
					"alliances",
					"characters",
					"corporations",
					"factions",
					"killmails",
					"systems",
					"types"
				].reduce((p, c) => !(p[c] = { href: `${config.site.url}/${c}/` }) || p, {})
			);
		}

	}

	module.exports = RootHandler;
