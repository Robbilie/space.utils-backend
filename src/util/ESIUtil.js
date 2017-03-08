
	"use strict";

	const Swagger 	= require("swagger-client");
	const spdy 		= require("spdy");
	const rp 		= require("request-promise-native");
	const request 	= rp.defaults({
		gzip: true, // actually slows down
		forever: true,
		//timeout: 1000 * 12,
		pool: {
			maxSockets: Infinity
		},
		resolveWithFullResponse: true,
		time: true/*,
		agentClass: spdy.Agent,
		agentOptions: {
			host: "esi.tech.ccp.is",
			port: 443,
			spdy: {
				plain: false,
				ssl: true
			}
		}*/
	});

	const { RPSUtil, MetricsUtil } = require("util/");

	const storage = {
		client: 		undefined,
		interval: 		undefined,
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
				storage.interval = RPSUtil.monotonic_loop(difference => {
					console.log("esi:", ...[storage.errors, storage.completed].map(x => (x / difference).toLocaleString()));
					storage.errors 		= 0;
					storage.completed 	= 0;
				});
			return new Swagger(Object.assign({
				url: process.env.ESI_URL,
				usePromise: true,
				authorizations: {
					someHeaderAuth: new Swagger.ApiKeyAuthorization("User-Agent", process.env.UA, "header")
				},
				client: { execute: async (obj) => {
					const start = process.hrtime();

					try {

						let { method, url, headers, body } = obj;
						MetricsUtil.inc("esi.started");
						let response = await request({ method, url, headers, body });
						let duration = process.hrtime(start);
						MetricsUtil.update("esi.elapsedTime", response.elapsedTime);
						MetricsUtil.update("esi.reqduration", (duration[0] * 1e9 + duration[1]) / 1e6);
						response.obj = JSON.parse(response.body);
						obj.on.response(response);

					} catch (e) {

						++storage.errors;
						obj.on.error(e);
						MetricsUtil.inc("esi.errors");

					}

					let duration = process.hrtime(start);
					MetricsUtil.update("esi.duration", (duration[0] * 1e9 + duration[1]) / 1e6);
					++storage.completed;
					MetricsUtil.inc("esi.completed");
					MetricsUtil.update("esi.rpstest", 1);

				} }
			}, options));
		}

		static get_all_pages (fn, params = {}, parallel = 10) {
			return ESIUtil.get_pages(fn, params, parallel);
		}

		static get_pages (fn, params = {}, parallel = 10, skip = 0) {
			return Promise
				.all([...new Array(parallel).keys()]
					.map(x => (skip * parallel + 1 + x))
					.map(id => ESIUtil.get_page(fn, params, id))
				).then(pages => {
					console.log(fn.name, "pages", skip * parallel + 1, "to", (skip + 1) * parallel);
					const expires = Math.max(...pages.map(({ headers: { expires } }) => new Date(expires).getTime()));
					const ids = [].concat(...pages.map(({ obj }) => obj));
					if (ids.length % 2000 == 0)
						return ESIUtil.get_pages(fn, params, parallel, skip + 1)
							.then(obj => ({ expires: Math.max(expires, obj.expires), ids: ids.concat(obj.ids) }));
					else
						return { expires, ids };
				});
		}

		static get_page (fn, params, page) {
			return new Promise((resolve, reject) => process.nextTick(() => fn(Object.assign(params, { page})).then(resolve).catch(reject)));
		}
		
	}
	
	module.exports = ESIUtil;
	