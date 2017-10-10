
	"use strict";

	const { Server, OPEN } 	= require("ws");
	const { DB, Oplog } 	= require("util/");

	class TaskOplogApp {

		async init () {

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
				if(tid !== undefined) {
					wss.broadcast(tid);
				}
			});

		}

	}

	module.exports = TaskOplogApp;
