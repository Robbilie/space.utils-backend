
	"use strict";

	const Swagger = require("swagger-client");

	const storage = {
		client: undefined
	};
	
	class ESIUtil {
		
		static get_client () {
			if(!storage.client)
				storage.client = this.new_client().catch(e => console.log("ESI Client Error") || !(delete storage.client) || ESIUtil.get_client());
			return storage.client;
		}

		static new_client (options = {}) {
			return new Swagger(Object.assign({ url: process.env.ESI_URL, usePromise: true, authorizations: { someHeaderAuth: new Swagger.ApiKeyAuthorization("User-Agent", process.env.UA, "header") } }, options));
		}
		
	}
	
	module.exports = ESIUtil;
	