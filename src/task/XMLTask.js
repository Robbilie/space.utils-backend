
	"use strict";

	const { RequestUtil } 			= require("util/");
	const { BaseTask } 				= require("task/");
	const { parseString } 			= require("xml2js");
	const config 					= require("util/../../config/");

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

			let { data, error } = await RequestUtil.call("XML", Object.assign({
				method: 		"POST",
				uri: 			`${config.ccp.api.url}/${url}.xml.aspx`,
				headers: 		{ "User-Agent": config.site.userAgent }
			}, query ? { form: query } : {}));

			return new Promise((resolve, reject) => parseString(data || error, (e, r) => {
				if(e) {
					console.log(data || error, e);
					reject(e);
				} else {
					resolve(r);
				}
			}));
		}

	}

	module.exports = XMLTask;