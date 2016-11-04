
	"use strict";

	const { BaseHandler } = require("handler/");

	class RootHandler extends BaseHandler {

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

	module.exports = RootHandler;
