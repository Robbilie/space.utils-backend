
	"use strict";

	const grpc = require('grpc');
	const jsYaml = require('js-yaml');

	const { SwaggerHTTPGRPC } = grpc.load(`${process.env.NODE_PATH}/../swagger-http-grpc/swagger-http.proto`);

	class GoHTTPClient {
		constructor(worker_address = "localhost", port = 50051){
			this.client = new SwaggerHTTPGRPC.Workers(`${worker_address}:${port}`, grpc.credentials.createInsecure());
			this.serializeRes = this.serializeRes.bind(this);
			this.doRequest = this.doRequest.bind(this);
		}

		doRequest(req){
			return new Promise((resolve, reject) =>
				this.client.doRequest(req, (err, resp) => {
					if (err) {
						reject(err)
					} else {
						resolve(resp)
					}
				})
			);
		}

		getRes(req) {
			return this.doRequest(req).then(res => {
				const serialized = this.serializeRes(res, {});

				if (!res.ok) {
					const error = new Error(res.statusText);
					error.statusCode = error.status = res.status;
					return serialized.then(
						(_res) => {
							error.response = _res;
							throw error;
						},
						(resError) => {
							error.responseError = resError;
							throw error;
						}
					);
				}

				return serialized;
			});
		}

		serializeRes(oriRes, {loadSpec = false} = {}) {
			return new Promise((resolve) => {
				const res = {
					ok: oriRes.ok,
					url: oriRes.url,
					status: oriRes.status,
					statusText: oriRes.statusText,
					headers: Object.entries(oriRes.headers).reduce((res, [key, {value}]) =>
							value.length === 1 ? Object.assign(res, { [key]: value[0] }) : Object.assign(res, { [key]: value })
						, {})
				};

				const useText = loadSpec || /json/.test(res.headers['content-type']) ||
					/xml/.test(res.headers['content-type']) ||
					/yaml/.test(res.headers['content-type']) ||
					/text/.test(res.headers['content-type']);

				res.text = oriRes.body;
				res.data = oriRes.body;

				if (useText) {
					try {
						// Optimistically try to convert all bodies
						const obj = jsYaml.safeLoad(oriRes.body);
						res.body = obj;
						res.obj = obj;
					}
					catch (e) {
						res.parseError = e;
					}
				}
				resolve(res);
			});

		}

		close(){
			grpc.closeClient(this.client);
		}
	}

	module.exports = GoHTTPClient;
