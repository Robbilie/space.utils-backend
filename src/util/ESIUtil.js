
	"use strict";

	const Swagger = require("swagger-client");

	const storage = {
		client: undefined
	};
	
	class ESIUtil {
		
		static get_client () {
			if(!storage.client)
				storage.client = this.new_client().catch(e => delete storage.client);
			return storage.client;
		}

		static new_client (options = {}) {
			return new Swagger(Object.assign({ url: process.env.ESI_URL, usePromise: true }, options));
		}
		
	}
	
	module.exports = ESIUtil;
	