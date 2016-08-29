
	"use strict";
	
	const { BaseTask } 				= require("task/");
	const config 					= require("util/../../config/");
	const rp 						= require("request-promise");
	const { parseString } 			= require("xml2js");

	class XMLTask extends BaseTask {

		static getType () {
			return "XML";
		}

		static getTasks () {
			return [
				{ type: ["Character", "Account"], accessMask: 2048, name: "MailMessagesTask" }
			];
		}

		async getXML (url, query) {

			// wait for a xml api queue spot
			await this.enqueue();

			let response;
			try {
				response = await rp(Object.assign({
					method: 		"POST",
					uri: 			`${config.ccp.api.url}/${url}.xml.aspx`,
					headers: 		{ "User-Agent": config.site.userAgent }
				}, query ? { form: query } : {}));	
			} catch (e) {
				response = e.error;
			}

			return new Promise((resolve, reject) => parseString(response, (e, r) => {
				if(e) {
					console.log(response);
					reject(e);
				} else {
					resolve(r);
				}
			}));
		}

	}

	module.exports = XMLTask;