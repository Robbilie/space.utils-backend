
	"use strict";

	const { Server } 		= require("ws");
	const { Oplog } 		= require("util/");
	const { BaseApp } 		= require("app/");

	class WSApp extends BaseApp {

		async init () {

			const server = this.start_heartbeat();
			this.ws = new Server({ server });
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
								Oplog
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
