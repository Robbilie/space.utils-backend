
	"use strict";

	const http 						= require("http");
	const express 					= require("express");
	const cors 						= require("cors");
	//const cookieParser 			= require("cookie-parser");
	//const bodyParser 				= require("body-parser");
	//const routes 					= require("util/../../routes/api");
	const config 					= require("util/../../config/");

	const swaggerTools 				= require("swagger-tools");
	const jsyaml 					= require("js-yaml");
	const fs 						= require("fs");

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

			/*
			web.use(bodyParser.json());
			web.use(bodyParser.urlencoded({ extended: false }));
			web.use(cookieParser(config.cookies.secret));

			web.use(routes);
			*/

			const controllers = [].concat(...(fs
				.readdirSync(process.env.NODE_PATH + "/handler")
				.map(file => require("handler/" + file))
				.map(cls => Object.getOwnPropertyNames(cls).slice(3).map(name => [cls.name + "_" + name, cls[name]()])))
				.filter(([k, v]) => typeof(v) == "function")
			).reduce((p, c) => !(p[c[0]] = c[1]) || p, {});

			console.log(controllers);

			swaggerTools.initializeMiddleware(jsyaml.safeLoad(fs.readFileSync(process.env.NODE_PATH + "/../routes/swagger.yaml")), middleware => {
				web.use(middleware.swaggerMetadata());
				web.use(middleware.swaggerValidator());
				web.use(middleware.swaggerRouter({
					swaggerUi: 		"/swagger.json",
					controllers,
					useStubs: 		process.env.NODE_ENV === 'development'
				}));
				web.use(middleware.swaggerUi());

				this.web 		= web;
				this.webServer 	= http.createServer(this.web).listen(config.site.apiport);
			});

		}

	}

	module.exports = APIApp;
