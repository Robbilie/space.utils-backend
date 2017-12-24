
	"use strict";

	const http 							= require("http");

	class BaseApp {

		constructor () {
			this.heartbeat = Date.now();
		}

		start_heartbeat (port = parseInt(process.env.APP_PORT)) {
			return http.createServer((req, res) => {
				console.log("webserver", req.url);
				switch (req.url) {
					case "/healthcheck":
						res.writeHead(this.heartbeat > Date.now() - (2 * 60 * 1000) ? 200 : 500, { "Content-Type": "text/plain" });
						res.end("healthcheck");
						if (this.heartbeat > Date.now() - (2 * 60 * 1000) === false)
							console.log("HEALTHCHECK FAIL");
						break;
					case "/ping":
						res.writeHead(200, { "Content-Type": "text/plain" });
						res.end("ping");
						break;
					default:
						res.writeHead(200, { "Content-Type": "text/plain" });
						res.end("ok");
						console.log("WTF HEARTBEAT DEFAULT");
						console.log(req);
						break;
				}
			}).listen(port);
		}

	}

	module.exports = BaseApp;
