
	"use strict";

	const {Router} 					= require("express");
	//const DBUtil 					= require("util/DBUtil");
	const RESTUtil 					= require("util/RESTUtil");

	const log 	= (req, res) => console.log(req) || res.json({});
	const m 	= { mergeParams: true };


	module.exports = Router(m).all("/:store/:id/:field*?/", RESTUtil.dynamicRoute);

	/*
	const getOrCreate = (req, res, name) => DBUtil
		.getStore(name)
		.then(store => store.getOrCreate(req.params.id - 0))
		.then(entity => res.json(entity ? entity : {}));
	*/
	/*
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
	*/