
	"use strict";

	const { RequestUtil } 			= require("util/");
	const { BaseTask } 				= require("task/");
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

			let { data, error } = await RequestUtil.call("XML", Object.assign({
				method: 		"POST",
				uri: 			`${process.env.XML_URL}/${url}.xml.aspx`,
				headers: 		{ "User-Agent": process.env.UA }
			}, query ? { form: query } : {}));

			if(!(data || error))
				console.log("how?!?!?", data, error, query);

			return new Promise((resolve, reject) => !(data || error) ? reject() : parseString(data || error, (e, r) => {
				if(e) {
					console.log(data || error, e, new Error());
					reject(e);
				} else {
					resolve(r);
				}
			}));
		}

	}

	module.exports = XMLTask;