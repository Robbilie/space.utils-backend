
	"use strict";

	const { Server } 				= require("ws");
	const routes 					= require("util/../../routes/api");
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

			this.ws = new Server({ port: process.env.APP_PORT });
			this.ws.on("connection", socket => {
				socket.json = function (data) { try { return this.send(JSON.stringify(data)); } catch (e) { return e; } };
				const onData = data => socket.json(data);
				const onError = error => socket.json(error);

				var interval = setInterval(() => { try { socket.send("ping"); } catch (e) { return e; } }, 10 * 1000);
				socket.on("close", () => clearInterval(interval));

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
									.then(cursor => {
										let stream = cursor.stream()
											.on("data", onData)
											.on("error", onError);
										socket.on("close", () => {
											stream.removeListener("data", onData);
											stream.removeListener("error", onError);
										});
									});
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
