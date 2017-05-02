
	"use strict";

	const Swagger 	= require("swagger-client");
	const rp 		= require("request-promise-native");
	const request 	= rp.defaults({
		//gzip: true, // actually slows down
		forever: true,
		//timeout: 1000 * 12,
		pool: {
			maxSockets: Infinity
		},
		resolveWithFullResponse: true,
		time: true
	});

	const { RPSUtil, MetricsUtil } = require("util/");

	const storage = {
		client: 		undefined,
		interval: 		undefined,
		errors: 		0,
		completed: 		0
	};

	const EXTENDED_METRICS = process.env.EXTENDED_METRICS == "true";
	
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
			return new Swagger({
				url: process.env.ESI_URL,
				requestInterceptor: (req) => {
					req.headers["User-Agent"] = process.env.UA;
					if (req.method === "POST")
						req.body = JSON.stringify(req.body);
					return req;
				},
				http: async (obj) => {
					let req = obj;
					if (obj.requestInterceptor)
						req = obj.requestInterceptor(obj);
					try {
						let { method, url, headers, body } = req;
						if (EXTENDED_METRICS)
							MetricsUtil.inc("esi.started");
						let res = await request({ method, url, headers, body });
						MetricsUtil.update("esi.elapsedTime", res.elapsedTime);
						res.body = JSON.parse(res.body);

						++storage.completed;
						MetricsUtil.inc("esi.completed");

						return res;
					} catch (e) {
						++storage.errors;
						MetricsUtil.inc("esi.errors");

						++storage.completed;
						MetricsUtil.inc("esi.completed");
					}
				}
			})
			/*return new Swagger(Object.assign({
				url: process.env.ESI_URL,
				usePromise: true,
				authorizations: {
					someHeaderAuth: new Swagger.ApiKeyAuthorization("User-Agent", process.env.UA, "header")
				},
				client: { execute: async (obj) => {

					try {

						let { method, url, headers, body } = obj;
						if (EXTENDED_METRICS)
							MetricsUtil.inc("esi.started");
						let response = await request({ method, url, headers, body: JSON.stringify(body) });
						MetricsUtil.update("esi.elapsedTime", response.elapsedTime);
						response.obj = JSON.parse(response.body);
						obj.on.response(response);

					} catch (e) {

						++storage.errors;
						obj.on.error(e);
						MetricsUtil.inc("esi.errors");

					}

					++storage.completed;
					MetricsUtil.inc("esi.completed");

				} }
			}, options));*/
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
					const ids = [].concat(...pages.map(({ body }) => obj));
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
	