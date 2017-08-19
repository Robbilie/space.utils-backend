
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
			config.spec = require(process.env.NODE_PATH + "/../specs/_latest.json");
		} catch (e) {}
	}

	function get_esi (args) {
		return new_esi(args).catch(e => console.log("ESI ERROR", e) || get_esi(args));
	}

	function new_esi ({ url, spec, userFetch }) {
		return new Swagger({ spec, url, userFetch });
	}

	module.exports = ((swaggerPromise) => new Proxy({}, {
		get: (_, tagName) => new Proxy({}, {
			get: (_, operationId) => (...args) => swaggerPromise.then(client => client.apis[tagName][operationId](...args))
		})
	}))(get_esi(config));
