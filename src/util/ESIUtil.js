
	"use strict";

	const Swagger = require("swagger-client");
	const rp = require("request-promise-native");
	const request = rp.defaults({
		gzip: true,
		forever: true,
		timeout: 1000 * 15,
		pool: {
			maxSockets: Infinity
		},
		resolveWithFullResponse: true
	});

	const storage = {
		client: undefined
	};
	
	class ESIUtil {
		
		static get_client () {
			if(!storage.client)
				storage.client = this.new_client().catch(e => console.log("ESI Client Error", e) || !(delete storage.client) || ESIUtil.get_client());
			return storage.client;
		}

		static new_client (options = {}) {
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
								response.obj = JSON.parse(response.body);
								obj.on.response(response);
							})
							.catch(e => obj.on.error(e));
					}
				}
			}, options));
		}
		
	}
	
	module.exports = ESIUtil;
	