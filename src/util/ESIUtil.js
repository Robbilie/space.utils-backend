
	"use strict";

	const Swagger = require("swagger-client");
	const rp = require("request-promise-native");
	const request = rp.defaults({
		gzip: true,
		forever: true,
		timeout: 1000 * 10,
		pool: {
			maxSockets: Infinity
		}
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
					execute: async (obj) => {
						try {
							obj.on.response(await request({
								method: obj.method,
								url: obj.url,
								headers: obj.headers,
								body: obj.body
							}));
						} catch (e) {
							obj.on.error(e);
						}
					}
				}
			}, options));
		}
		
	}
	
	module.exports = ESIUtil;
	