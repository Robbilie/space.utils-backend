
	"use strict";

	const { Server } 				= require("ws");
	const routes 					= require("util/../../routes/api");
	const config 					= require("util/../../config/");

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
						routes.handle(JSON.parse(message), {json: json => socket.json(json) });
					} catch (e) {
						socket.json({ error: e })
					}
				});
			});

		}

	}

	module.exports = WSApp;
