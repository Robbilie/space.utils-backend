
	"use strict";

	const http 						= require("http");
	const express 					= require("express");
	const cors 						= require("cors");
	const cookieParser 				= require("cookie-parser");
	const bodyParser 				= require("body-parser");
	const routes 					= require("util/../../routes/web");
	const config 					= require("util/../../config/");

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
			web.use(bodyParser.json());
			web.use(bodyParser.urlencoded({ extended: false }));
			web.use(cookieParser(config.cookies.secret));

			web.use(routes);

			this.web 		= web;
			this.webServer 	= http.createServer(this.web).listen(config.site.apiport);

		}

	}

	module.exports = APIApp;