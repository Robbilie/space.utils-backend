
	"use strict";

	const Swagger = require("swagger-client");
	const rp = require("request-promise-native");
	const request = rp.defaults({
		//gzip: true, // actually slows down
		forever: true,
		timeout: 1000 * 12,
		pool: {
			maxSockets: Infinity
		},
		resolveWithFullResponse: true
	});

	const storage = {
		client: 		undefined,
		interval: 		undefined,
		log_interval: 	60,
		errors: 		0,
		completed: 		0
	};
	
	class ESIUtil {
		
		static get_client () {
			if(!storage.client)
				storage.client = this.new_client().catch(e => console.log("ESI Client Error", e) || !(delete storage.client) || ESIUtil.get_client());
			return storage.client;
		}

		static new_client (options = {}) {
			if(!storage.interval)
				storage.interval = setInterval(() => {
					console.log(
						"esi:",
						(storage.errors 	/ storage.log_interval).toLocaleString(),
						(storage.completed 	/ storage.log_interval).toLocaleString()
					);
					storage.errors 		= 0;
					storage.completed 	= 0;
				}, storage.log_interval * 1000);
			return new Swagger(Object.assign({
				url: process.env.ESI_URL,
				usePromise: true,
				authorizations: {
					someHeaderAuth: new Swagger.ApiKeyAuthorization("User-Agent", process.env.UA, "header")
				},
				client: {
					execute: function (obj) {
						let { method, url, headers, body } = obj;
						request({ method, url, headers, body })
							.then(response => {
								try {
									response.obj = JSON.parse(response.body);
									obj.on.response(response);
								} catch (e) {
									throw ({ e, response });
								}
							})
							.catch(e => {
								++storage.errors;
								obj.on.error(e);
							})
							.then(() => ++storage.completed);
					}
				}
			}, options));
		}
		
	}
	
	module.exports = ESIUtil;
	