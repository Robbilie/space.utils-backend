
	"use strict";

	const ejs 				= require("ejs");
	const fs 				= require("fs");
	const jsyaml 			= require("js-yaml");
	const client 			= ejs.render(
		fs.readFileSync(process.env.NODE_PATH + "/views/client.ejs"),
		jsyaml.safeLoad(fs.readFileSync(process.env.NODE_PATH + "/../routes/swagger.yaml")),
		{}
	);
	const { BaseHandler } 	= require("handler/");
	const config 			= require("util/../../config/");

	class RootHandler extends BaseHandler {

		static home () {
			return async (req, res) => res.json(
				[
					"alliances",
					"characters",
					"corporations",
					"factions",
					"killmails",
					"systems",
					"types"
				].reduce((p, c) => !(p[c] = { href: `${config.site.url}/${c}/` }) || p, {})
			);
		}

		static client () {
			return async (req, res) => {
				res.set("Content-Type", "text/javascript");
				res.send(client);
			};
		}

	}

	module.exports = RootHandler;
