
	"use strict";

	const { BaseHandler } 			= require("handler/");

	class RootHandler extends BaseHandler {

		static async get_home (_, res) {
			res.json({});
		}

	}

	module.exports = RootHandler;
