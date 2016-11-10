
	"use strict";

	const ejs 				= require("ejs");
	const fs 				= require("fs");
	const swagger 			= require("js-yaml").safeLoad(fs.readFileSync(process.env.NODE_PATH + "/../routes/swagger.yaml"));
	const { BaseHandler } 	= require("handler/");

	class RootHandler extends BaseHandler {

		static home () {
			return async (_, { json}) =>
				json([
					"alliances",
					"characters",
					"corporations",
					"factions",
					"killmails",
					"systems",
					"types"
				].reduce((p, c) => !(p[c] = { href: `https://api.${process.env.HOST}/${c}/` }) || p, {}));
		}

		static client () {
			return async (_, { set, send }) => {
				ejs.renderFile(process.env.NODE_PATH + "/../views/client.ejs", { swagger }, (err, data) => {
					set("Content-Type", "text/javascript");
					send(err ? JSON.stringify(err, null, 2) : data);
				});
			};
		}

	}

	module.exports = RootHandler;
