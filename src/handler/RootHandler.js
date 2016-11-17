
	"use strict";

	const { BaseHandler } 			= require("handler/");

	class RootHandler extends BaseHandler {

		static home (_, { json }) {
			json({});
		}

	}

	module.exports = RootHandler;
