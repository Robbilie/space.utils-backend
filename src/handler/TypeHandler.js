
	"use strict";

	const { EntityHandler } = require("handler/");

	class TypeHandler extends EntityHandler {

		static post_type_filter (...args) {
			return super.post_filter(...args);
		}

		static get_types_type_id (...args) {
			return super.get_by_id(...args);
		}

	}

	module.exports = TypeHandler;
