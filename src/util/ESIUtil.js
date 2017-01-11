
	"use strict";

	const Swagger 	= require("swagger-client");
	const spdy 		= require("spdy");
	const http2 	= require("http2");

	http2.Agent.prototype.addRequest = function addRequest(req, options) {
		// Legacy API: addRequest(req, host, port, localAddress)
		if (typeof options === 'string') {
			options = {
				host: options,
				port: arguments[2],
				localAddress: arguments[3]
			};
		}

		options = Object.assign({}, options);
		options = Object.assign(options, this.options);

		if (!options.servername) {
			options.servername = options.host;
			const hostHeader = req.getHeader('host');
			if (hostHeader) {
				options.servername = hostHeader.replace(/:.*$/, '');
			}
		}

		var name = this.getName(options);
		if (!this.sockets[name]) {
			this.sockets[name] = [];
		}

		var freeLen = this.freeSockets[name] ? this.freeSockets[name].length : 0;
		var sockLen = freeLen + this.sockets[name].length;

		if (freeLen) {
			// we have a free socket, so use that.
			var socket = this.freeSockets[name].shift();

			// don\'t leak
			if (!this.freeSockets[name].length)
				delete this.freeSockets[name];

			socket.ref();
			req.onSocket(socket);
			this.sockets[name].push(socket);
		} else if (sockLen < this.maxSockets) {
			// If we are under maxSockets create a new one.
			this.createSocket(req, options, function(err, newSocket) {
				if (err) {
					process.nextTick(function() {
						req.emit('error', err);
					});
					return;
				}
				req.onSocket(newSocket);
			});
		} else {
			// We are over limit so we\'ll add it to the queue.
			if (!this.requests[name]) {
				this.requests[name] = [];
			}
			this.requests[name].push(req);
		}
	};
	const rp 		= require("request-promise-native");
	const request 	= rp.defaults({
		/*agentClass: spdy.Agent,
		agentOptions: {
			host: "esi.tech.ccp.is",
			port: 443
		},*/
		agentClass: http2.Agent,
		//gzip: true, // actually slows down
		forever: true,
		timeout: 1000 * 12,
		pool: {
			maxSockets: Infinity
		},
		resolveWithFullResponse: true
	});

	const storage = {
		client: 		undefined,
		interval: 		undefined,
		log_interval: 	60,
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
				storage.interval = setInterval(() => {
					console.log(
						"esi:",
						(storage.errors 	/ storage.log_interval).toLocaleString(),
						(storage.completed 	/ storage.log_interval).toLocaleString()
					);
					storage.errors 		= 0;
					storage.completed 	= 0;
				}, storage.log_interval * 1000);
			return new Swagger(Object.assign({
				url: process.env.ESI_URL,
				usePromise: true,
				authorizations: {
					someHeaderAuth: new Swagger.ApiKeyAuthorization("User-Agent", process.env.UA, "header")
				},
				client: {
					execute: function (obj) {
						let { method, url, headers, body } = obj;
						request({ method, url, headers, body })
							.then(response => {
								try {
									response.obj = JSON.parse(response.body);
									obj.on.response(response);
								} catch (e) {
									throw ({ e, response });
								}
							})
							.catch(e => {
								++storage.errors;
								obj.on.error(e);
							})
							.then(() => ++storage.completed);
					}
				}
			}, options));
		}
		
	}
	
	module.exports = ESIUtil;
	