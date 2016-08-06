
	"use strict";
	
	const BaseTask 					= require("task/BaseTask");
	const config 					= require("util/../../config/");
	const rp 						= require("request-promise");

	class CRESTTask extends BaseTask {

		static getType () {
			return "CREST";
		}

		async getCREST (url, query) {

			// wait for a xml api queue spot
			await this.enqueue();

			//console.log("url", url, "query", query);

			let response;
			try {
				response = await rp({
					method: 		"POST",
					uri: 			`${config.crest.api.url}${url}`,
					headers: 		{ "User-Agent": config.site.userAgent }
				});
			} catch (e) {
				//console.log(e);
				response = e.error;
			}

			return JSON.parse(response);
		}

	};

	module.exports = CRESTTask;