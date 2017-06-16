
	"use strict";

	const Swagger = require('swagger-client');
	const grpc = require('grpc');
	const qs = require('qs');
	const jsYaml = require('js-yaml');

	const { SwaggerHTTPGRPC } = grpc.load(`${process.env.NODE_PATH}/../swagger-http-grpc/swagger-http.proto`);

	class GoHTTPClient {
		constructor(worker_address = "localhost", port = 50051){
			this.client = new SwaggerHTTPGRPC.Workers(`${worker_address}:${port}`, grpc.credentials.createInsecure());
			this.http2 = this.http2.bind(this);
			this.serializeRes = this.serializeRes.bind(this);
			this.doRequest = this.doRequest.bind(this);
			this.shouldDownloadAsText.bind(this);
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

		shouldDownloadAsText(contentType) {
			return /json/.test(contentType) ||
				/xml/.test(contentType) ||
				/yaml/.test(contentType) ||
				/text/.test(contentType);
		}

		http2(url, request = {}) {
			if (typeof url === 'object') {
				request = url;
				url = request.url;
			}

			request.headers = request.headers || {};

			if (request.form) {
				return Swagger.http(request);
			}

			const contentType = request.headers['content-type'] || request.headers['Content-Type'];
			if (/multipart\/form-data/i.test(contentType)) {
				return Swagger.http(request);
			}

			request.method = request.method || "GET";

			if (request.method !== "GET" && request.method !== "POST" && request.method !== "PUT" && request.method !== "DELETE") {
				return Swagger.http(request);
			}

			if (request.requestInterceptor) {
				request = request.requestInterceptor(request) || request;
			}

			if (request.query) {
				request = this.mergeInQuery(request);
			}

			const req = {
				url: request.url,
				method: request.method,
				headers: request.headers,
				credentials: request.credentials,
				body: request.body
			};
			return this.getRes(req);
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

		mergeInQuery(request) {
			const {url = '', query} = request;
			const joinSearch = (...strs) => {
				const search = strs.filter(a => a).join('&'); // Only truthy value
				return search ? `?${search}` : ''; // Only add '?' if there is a str
			};

			const [baseUrl, oriSearch] = url.split('?');
			let newStr = '';

			if (oriSearch) {
				const oriQuery = qs.parse(oriSearch);
				const keysToRemove = Object.keys(query);
				keysToRemove.forEach(key => delete oriQuery[key]);
				newStr = qs.stringify(oriQuery, {encode: true});
			}

			const finalStr = joinSearch(newStr, this.encodeFormOrQuery(query));
			request.url = baseUrl + finalStr;

			delete (request.query);
			return request;
		}

		// Encodes an object using appropriate serializer.
		encodeFormOrQuery(data) {
			/**
			 * Encode parameter names and values
			 * @param {Object} result - parameter names and values
			 * @param {string} parameterName - Parameter name
			 * @return {object} encoded parameter names and values
			 */
			const encodedQuery = Object.entries(data).reduce((result, [ parameterName, paramValue ]) => {
				const isObject = a => a && typeof a === 'object';
				const encodedParameterName = encodeURIComponent(parameterName);
				const notArray = isObject(paramValue) && !Array.isArray(paramValue);
				result[encodedParameterName] = this.formatValue(notArray ? paramValue : {value: paramValue});
				return result;
			}, {});
			return qs.stringify(encodedQuery, {encode: false, indices: false}) || '';
		}

		formatValue({value, collectionFormat, allowEmptyValue}, skipEncoding) {
			const SEPARATORS = {
				csv: ',',
				ssv: '%20',
				tsv: '%09',
				pipes: '|'
			};

			if (typeof value === 'undefined' && allowEmptyValue) {
				return '';
			}

			let encodeFn = encodeURIComponent;
			if (skipEncoding) {
				if (typeof(value) === "string") encodeFn = str => str;
				else encodeFn = obj => JSON.stringify(obj);
			}

			if (value && !Array.isArray(value)) {
				return encodeFn(value);
			}
			if (Array.isArray(value) && !collectionFormat) {
				return value.map(encodeFn).join(',');
			}
			if (collectionFormat === 'multi') {
				return value.map(encodeFn);
			}
			return value.map(encodeFn).join(SEPARATORS[collectionFormat]);
		}

		close(){
			grpc.closeClient(this.client);
		}
	}

	module.exports = GoHTTPClient;
