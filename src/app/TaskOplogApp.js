
	"use strict";

	const { Server, OPEN } 	= require("ws");
	const { DB } 			= require("util/");
	const { BaseApp } 		= require("app/");

	class TaskOplogApp extends BaseApp {

		async init () {

			const server = this.start_heartbeat();

			const wss = new Server({ server });

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
				this.heartbeat = Date.now();
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
					}
				});
			} catch (e) {}

		}

	}

	module.exports = TaskOplogApp;
