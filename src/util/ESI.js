
	"use strict";

	const Swagger 	= require("swagger-client");
	const rp 		= require("request-promise-native");
	const request 	= rp.defaults({
		// gzip: true, // actually slows down
		forever: true,
		//timeout: 1000 * 12,
		pool: {
			maxSockets: Infinity
		},
		resolveWithFullResponse: true,
		time: true
	});

	const { Metrics, GoHTTPClient } = require("util/");

	const config = {
		url: process.env.ESI_URL,
		ua: process.env.UA,
		EXTENDED_METRICS: process.env.EXTENDED_METRICS === "true",
		proxy: new GoHTTPClient(process.env.GO_H2_PROXY_HOST, process.env.GO_H2_PROXY_PORT)
	};

	if (config.url === undefined) {
		try {
			config.spec = require(process.env.NODE_PATH + "/../specs/_latest.json");
		} catch (e) {}
	}

	function get_esi (args) {
		return new_esi(args).catch(e => console.log("ESI ERROR", e) || get_esi(args));
	}

	function new_esi ({ url, spec, ua, EXTENDED_METRICS, proxy }) {
		return new Swagger({
			spec,
			url,
			requestInterceptor: (req) => {
				req.headers["User-Agent"] = ua;
				return req;
			},
			http: async (obj) => {
				let req = obj;
				if (obj.requestInterceptor !== undefined)
					req = obj.requestInterceptor(obj);
				try {
					let { method, url, headers, body } = req;

					if (EXTENDED_METRICS === true)
						Metrics.inc("esi.started");

					let res = await request({ method, url, headers, body });
					//let res = await proxy.http2({ method, url, headers, body });

					Metrics.update("esi.elapsedTime", res.elapsedTime);

					if (res.headers.age === undefined)
						Metrics.inc("esi.cacheMiss");

					res.body = JSON.parse(res.body);

					Metrics.inc("esi.successful");
					Metrics.inc("esi.completed");

					return res;
				} catch (e) {
					Metrics.inc("esi.errors");
					Metrics.inc("esi.completed");

					throw e;
				}
			}
		});
	}

	module.exports = ((swaggerPromise) => new Proxy({}, {
		get: (_, tagName) => new Proxy({}, {
			get: (_, operationId) => (...args) => swaggerPromise.then(client => client.apis[tagName][operationId](...args))
		})
	}))(get_esi(config));
