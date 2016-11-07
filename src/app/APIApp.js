
	"use strict";

	const http 						= require("http");
	const express 					= require("express");
	const cors 						= require("cors");
	const config 					= require("util/../../config/");

	const fs 						= require("fs");
	const swagger 					= require("js-yaml").safeLoad(fs.readFileSync(process.env.NODE_PATH + "/../routes/swagger.yaml"));
	const swaggerTools 				= require("swagger-tools");

	class APIApp {

		constructor () {
			try {
				this.init();
			} catch (e) {
				console.log(e);
			}
		}

		async init () {
			
			const web = express();

			web.set("json spaces", 2);
			web.enable("trust proxy");

			web.use(cors());

			// black magic to map the controllers to a cached object
			const controllers = [].concat(...(fs
				.readdirSync(process.env.NODE_PATH + "/handler")
				.filter(file => file != "index.js")
				.map(file => require("handler/" + file))
				.map(cls => cls
					.getMethods()
					.map(name => [cls.name + "_" + name, cls[name]()])
					.filter(([k, v]) => typeof(v) == "function")
					.map(([k, v]) => [k, (...args) => v(...args)])
				)
			)).reduce((p, c) => !(p[c[0]] = c[1]) || p, {});

			swaggerTools.initializeMiddleware(swagger, middleware => {
				web.use(middleware.swaggerMetadata());
				web.use(middleware.swaggerValidator());
				web.use(middleware.swaggerRouter({
					controllers: 	controllers,
					useStubs: 		process.env.NODE_ENV === 'development'
				}));
				web.use(middleware.swaggerUi({
					//apiDocs: 		"/swagger.json"
				}));

				this.web 		= web;
				this.webServer 	= http.createServer(this.web).listen(process.env.APP_PORT);
			});

		}

	}

	module.exports = APIApp;
