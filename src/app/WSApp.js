
	"use strict";

	const { Server } 				= require("ws");
	const { DBUtil } 				= require("util/");

	class WSApp {

		async init () {

			this.ws = new Server({ port: parseInt(process.env.APP_PORT) });
			this.ws.on("connection", socket => {
				socket.json = function (data) { try { return this.send(JSON.stringify(data)); } catch (e) { return e; } };
				const onData = data => socket.json(data);
				const onError = error => socket.json(error);

				const interval = setInterval(() => { try { socket.send("ping"); } catch (e) { return e; } }, 10 * 1000);
				socket.on("close", () => clearInterval(interval));

				socket.on("message", message => {
					try {
						const msg = JSON.parse(message);
						switch (msg.type) {
							case "stream":
								DBUtil
									.get_oplog_cursor({ ns: msg.data.name, op: "i" })
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
					} catch (error) {
						socket.json({ error })
					}
				});
			});

		}

	}

	module.exports = WSApp;
