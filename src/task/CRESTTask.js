
	"use strict";
	
	const { BaseTask } 				= require("task");
	const config 					= require("util/../../config/");
	const rp 						= require("request-promise");

	class CRESTTask extends BaseTask {

		static getType () {
			return "CREST";
		}

		async getCREST (url, query) {

			// wait for a xml api queue spot
			await this.enqueue();

			let response;
			try {
				response = await rp({
					method: 		"POST",
					uri: 			`${config.crest.api.url}${url}`,
					headers: 		{ "User-Agent": config.site.userAgent }
				});
			} catch (e) {
				response = e.error;
			}

			return JSON.parse(response);
		}

	}

	module.exports = CRESTTask;
