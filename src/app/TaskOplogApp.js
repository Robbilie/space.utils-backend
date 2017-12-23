
	"use strict";

	const { Server, OPEN } 	= require("ws");
	const { DB, Oplog } 	= require("util/");
	const http 				= require("http");

	class TaskOplogApp {

		async init () {

			this.heartbeat = Date.now();

			this.start_heartbeat();

			const wss = new Server({ port: parseInt(process.env.APP_PORT) });

			wss.broadcast = data => wss.clients.forEach(client => {
				if (client.readyState === OPEN) {
					client.send(data);
				}
			});

			function heartbeat () {
				this.isAlive = true;
			}

			wss.on("connection", con => {
				con.isAlive = true;
				con.on("pong", heartbeat);
			});

			setInterval(() => {
				wss.clients.forEach(client => {
					if (client.isAlive === false)
						return client.terminate();
					client.isAlive = false;
					client.ping("", false, true);
				});
			}, 30000);

			/*
			Oplog.updates({ ns: "tasks" }, undefined, async ({ op, o, o2 }) => {
				let tid;
				switch (op) {
					case "d":
						tid = o._id.toString();
						break;
					case "u":
						if(o !== undefined && o.set !== undefined && o.set["info-state"] === 0) {
							tid = o2._id.toString();
						} else {
							console.log("DB TASK _ID SHOULD NOT HAPPEN");
							let task = await DB.collection("tasks").findOne({ _id: o2._id });
							if (task && task.info.state === 0)
								tid = o2._id.toString();
						}
						break;
				}
				console.log("broadcasting", tid);
				if(tid !== undefined) {
					wss.broadcast(tid);
				}
			});
			*/

			try {
				const collection = await DB.collection("tasks");
				const changeStream = collection.watch();
				changeStream.on("change", change => {
					let tid;
					switch (change.operationType) {
						case "delete":
							tid = change.documentKey._id.toString();
							break;
						case "update":
							if (change.updateDescription.updatedFields["info.state"] === 0)
								tid = change.documentKey._id.toString();
							break;
					}
					if(tid !== undefined) {
						//console.log("broadcasting", tid);
						wss.broadcast(tid);
						this.heartbeat = Date.now();
					}
				});
			} catch (e) {}

		}

		start_heartbeat () {
			http.createServer((req, res) => {
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
			}).listen(parseInt(process.env.APP_PORT));
		}

	}

	module.exports = TaskOplogApp;
