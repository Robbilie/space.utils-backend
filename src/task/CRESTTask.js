
	"use strict";

	const { RequestUtil } 			= require("util/");
	const { BaseTask } 				= require("task/");

	class CRESTTask extends BaseTask {

		static getType () {
			return "CREST";
		}

		async getCREST (url, query) {

			let { data, error } = await RequestUtil.call("CREST", {
				method: 		"GET",
				uri: 			`${config.ccp.crest.href}${url}`,
				headers: 		{ "User-Agent": config.app.ua}
			});

			try {
				return JSON.parse(data || error);
			} catch (e) {
				console.log("CE", data || error);
				throw e;
			}
		}

	}

	module.exports = CRESTTask;
