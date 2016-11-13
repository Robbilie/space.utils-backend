
	"use strict";

	const http 						= require("http");
	const express 					= require("express");
	const cors 						= require("cors");

	const fs 						= require("fs");
	const swaggerTools 				= require("swagger-tools");

	class APIApp {

		async init () {

			// black magic to map the controllers to a cached object for swagger
			const controllers = [].concat(...(fs
				.readdirSync(process.env.NODE_PATH + "/handler")
				.filter(file => file != "index.js")
				.map(file => require(`handler/${file}`))
				.map(Class => Class
					.getMethods()
					.map(MethodName => [`${Class.name}_${MethodName}`, Class[MethodName]])
					.map(([key, fn]) => [key, (...args) => fn(...args)])
				)
			)).reduce((p, c) => !(p[c[0]] = c[1]) || p, {});

			swaggerTools.initializeMiddleware(require("js-yaml").safeLoad(fs.readFileSync(process.env.NODE_PATH + "/../routes/swagger.yaml")), middleware => {

				const web = express();

				web.set("json spaces", 2);
				web.enable("trust proxy");

				web.use(cors());

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
				http.createServer(this.web).listen(parseInt(process.env.APP_PORT));
			});

		}

	}

	module.exports = APIApp;
