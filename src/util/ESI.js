
	"use strict";

	const Swagger 	= require("swagger-client");
	const { GoHTTPClient } = require("util/");

	const config = {
		url: process.env.ESI_URL,
		ua: process.env.UA,
		EXTENDED_METRICS: process.env.EXTENDED_METRICS === "true",
		userFetch: new GoHTTPClient(process.env.GO_H2_PROXY_HOST, process.env.GO_H2_PROXY_PORT).doRequest
	};

	if (config.url === undefined) {
		try {
			config.spec = require(`${process.env.NODE_PATH}/../specs/_latest.json`);
		} catch (e) {
			console.log("No spec file.", e);
		}
	}

	function get_esi (args) {
		return new_esi(args).catch(e => console.log("ESI ERROR", e) || get_esi(args));
	}

	function new_esi ({ url, spec, userFetch }) {
		console.log(`~ Creating new Swagger`);
		return new Swagger({ spec, url, userFetch }).then(swagger => console.log(`~ Created new Swagger`) || swagger);
	}

	module.exports = ((swaggerPromise) => new Proxy({}, {
		get: (_1, tagName) => new Proxy({}, {
			get: (_2, operationId) => (...args) => swaggerPromise.then(client => client.apis[tagName][operationId](...args))
		})
	}))(get_esi(config));
