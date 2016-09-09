
	"use strict";

	const { RequestUtil } 			= require("util/");
	const { BaseTask } 				= require("task/");
	const config 					= require("util/../../config/");

	class CRESTTask extends BaseTask {

		static getType () {
			return "CREST";
		}

		async getCREST (url, query) {

			let { data, error } = await RequestUtil.call("CREST", {
				method: 		"GET",
				uri: 			`${config.crest.api.url}${url}`,
				headers: 		{ "User-Agent": config.site.userAgent }
			});

			return JSON.parse(data || error);
		}

	}

	module.exports = CRESTTask;
