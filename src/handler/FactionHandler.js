
	"use strict";

	const { EntityHandler } = require("handler/");

	class FactionHandler extends EntityHandler {

		static post_factions_filter (...args) {
			return super.post_filter(...args);
		}

		static get_factions_faction_id (...args) {
			return super.get_by_id(...args);
		}

	}

	module.exports = FactionHandler;
