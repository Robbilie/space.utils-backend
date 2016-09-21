
	"use strict";

	const { Server } 				= require("ws");
	const routes 					= require("util/../../routes/api");
	const config 					= require("util/../../config/");
	const { DBUtil } 				= require("util/");

	class WSApp {

		constructor () {
			try {
				this.init();
			} catch (e) {
				console.log(e);
			}
		}

		async init () {

			this.ws = new Server({ port: config.site.wsport });
			this.ws.on("connection", socket => {
				socket.json = function (data) { return this.send(JSON.stringify(data)); };
				socket.on("message", message => {
					try {
						const msg = JSON.parse(message);
						switch (msg.type) {
							case "http":
								routes.handle(msg.data, { json: data => socket.json({ id: msg.id, data }) });
								break;
							case "stream":
								DBUtil
									.getOplogCursor({ ns: msg.data.name, op: "i" })
									.then(cursor => cursor
										.each((err, data) => socket.json(err || data))
									);
								break;
						}
					} catch (e) {
						socket.json({ error: e })
					}
				});
			});

		}

	}

	module.exports = WSApp;
