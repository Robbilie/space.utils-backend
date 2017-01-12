
	"use strict";

	const Swagger 	= require("swagger-client");
	const rp 		= require("request-promise-native");
	const request 	= rp.defaults({
		//gzip: true, // actually slows down // esi is borked -.-
		forever: true,
		//timeout: 1000 * 15,
		pool: {
			maxSockets: Infinity
		},
		resolveWithFullResponse: true
	});

	const storage = {
		client: 		undefined,
		interval: 		undefined,
		interval_beat: 	Date.now(),
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
					let timeframe = (Date.now() - storage.interval_beat) / 1000;
					console.log(
						"esi:",
						(storage.errors 	/ timeframe).toLocaleString(),
						(storage.completed 	/ timeframe).toLocaleString()
					);
					storage.errors 			= 0;
					storage.completed 		= 0;
					storage.interval_beat 	= Date.now();
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
	