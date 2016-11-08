
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
				uri: 			`${process.env.CREST_URL}${url}`,
				headers: 		{ "User-Agent": process.env.UA }
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
