
	"use strict";

	const {Router} 					= require("express");
	const DBUtil 					= require("util/DBUtil");

	const log 	= (req, res) => console.log(req) || res.json({});
	const m 	= { mergeParams: true };

	module.exports = Router(m)
		.get("/", log)
		.use("/characters", Router(m)
			.get("/", log)
			.get("/:id/", (req, res) => DBUtil.getStore("Character").then(store => store.getOrCreate(req.params.id - 0)).then(char => res.json(char ? char.getData() : {})))
		)
		.use("/corporations", Router(m)
			.get("/", log)
			.get("/:id/", log)
		);