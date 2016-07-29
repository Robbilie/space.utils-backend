
	"use strict";

	const {Router} 					= require("express");

	const log 	= req => console.log(req);
	const m 	= { mergeParams: true };

	module.exports = Router(m)
		.get("/", log)
		.use("/characters", Router(m)
			.get("/", log)
			.get("/:id/", log)
		)
		.use("/corporations", Router(m)
			.get("/", log)
			.get("/:id/", log)
		);