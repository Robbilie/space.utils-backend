
	"use strict";

	const { BaseHandler } 			= require("handler/");

	class RootHandler extends BaseHandler {

		static async home (_, res) {
			res.json({});
		}

	}

	module.exports = RootHandler;
