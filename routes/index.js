
	"use strict";

	const {Router} 					= require("express");
	const DBUtil 					= require("util/DBUtil");

	const log 	= (req, res) => console.log(req) || res.json({});
	const m 	= { mergeParams: true };

	const getOrCreate = (req, res, name) => DBUtil
		.getStore(name)
		.then(store => store.getOrCreate(req.params.id - 0))
		.then(entity => res.json(entity ? entity.getData() : {}));

	module.exports = Router(m)
		.get("/", log)
		.use("/characters", Router(m)
			.get("/", log)
			.get("/:id/", (req, res) => getOrCreate(req, res, "Character"))
		)
		.use("/corporations", Router(m)
			.get("/", log)
			.get("/:id/",  (req, res) => getOrCreate(req, res, "Corporation"))
		)
		.use("/alliances", Router(m)
			.get("/", log)
			.get("/:id/",  (req, res) => getOrCreate(req, res, "Alliance"))
		);