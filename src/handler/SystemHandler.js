
	"use strict";

	const { EntityHandler } = require("handler/");

	class SystemHandler extends EntityHandler {

		static post_systems_filter (...args) {
			return super.post_filter(...args);
		}

		static get_systems_system_id (...args) {
			return super.get_by_id(...args);
		}

	}

	module.exports = SystemHandler;
