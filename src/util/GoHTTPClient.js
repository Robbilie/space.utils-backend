
	"use strict";

	const grpc = require('grpc');
	const { Metrics } = require("util/");

	const { SwaggerHTTPGRPC } = grpc.load(`${process.env.NODE_PATH}/../swagger-http-grpc/swagger-http.proto`);

	class GoHTTPClient {

		constructor (worker_address = "localhost", port = 50051) {
			this.client = new SwaggerHTTPGRPC.Workers(`${worker_address}:${port}`, grpc.credentials.createInsecure());
			this.doRequest = this.doRequest.bind(this);
		}

		doRequest (url, options) {
			return new Promise((resolve, reject) =>
				this.client.doRequest({ url, ...options }, (err, res) => {
					if (err) {
						Metrics.inc("esi.errors");
						Metrics.inc("esi.completed");
						reject(err)
					} else {
						if (res.headers.age === undefined)
							Metrics.inc("esi.cacheMiss");
						Metrics.inc("esi.successful");
						Metrics.inc("esi.completed");
						resolve(res)
					}
				})
			);
		}

		close () {
			grpc.closeClient(this.client);
		}

	}

	module.exports = GoHTTPClient;
