
	"use strict";

	const grpc = require('grpc');
	const { Metrics } = require("util/");

	const { SwaggerHTTPGRPC } = grpc.load(`${process.env.NODE_PATH}/../node_modules/swagger-http-grpc/swagger-http.proto`);

	class GoHTTPClient {

		constructor (worker_address = "localhost", port = 50051) {
			this.client = new SwaggerHTTPGRPC.Workers(`${worker_address}:${port}`, grpc.credentials.createInsecure());
			this.doRequest = this.doRequest.bind(this);
		}

		doRequest (url, { headers, method, body }) {
			return new Promise((resolve, reject) =>
				this.client.doRequest({ url, headers, method, body }, (err, res) => {
					if (err) {
						Metrics.inc("esi.errors");
						Metrics.inc("esi.completed");
						reject(err);
					} else {
						if (res.headers.age === undefined)
							Metrics.inc("esi.cacheMiss");
						if (res.status >= 400)
							Metrics.inc("esi.errors");
						else
							Metrics.inc("esi.successful");
						Metrics.inc(`esi.status.${res.status}`);
						Metrics.inc("esi.completed");
						resolve(Object.assign(res, {
							headers: Object.assign(Object
								.entries(res.headers)
								.reduce((res, [key, { value }]) => Object.assign(res, { [key]: value.length === 1 ? value[0] : value }), {}),
								{ forEach: function (cb) { Object.entries(this).filter(([k]) => k !== "forEach").forEach(([k, v], i, o) => cb(v, k, o)) } }),
							text: async function () { return this.body; }
						}));
					}
				})
			);
		}

		close () {
			grpc.closeClient(this.client);
		}

	}

	module.exports = GoHTTPClient;
