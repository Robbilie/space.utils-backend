
	"use strict";

	const { Router } = require("express");
	const {
		CharacterHandler,
		CorporationHandler,
		AllianceHandler,
		KillmailHandler
	} = require("handler");
	const m = { mergeParams: true };

	module.exports = Router(m)
		.get("/", (req, res) => {
			// TODO : respond with dummy json listing routes
		})
		.use("/characters", Router(m)
			.get("/",
				CharacterHandler.filter())
			.get("/:id/",
				CharacterHandler.getById())
			.get("/:id/corporation/",
				CharacterHandler.getCorporation())
		)
		.use("/corporations", Router(m)
			.get("/",
				CorporationHandler.filter())
			.get("/:id/",
				CorporationHandler.getById())
			.get("/:id/alliance/",
				CorporationHandler.getAlliance())
			.get("/:id/ceo/",
				CorporationHandler.getCEO())
		)
		.use("/alliances", Router(m)
			.get("/",
				AllianceHandler.filter())
			.get("/:id/",
				AllianceHandler.getById())
			.get("/:id/executor/",
				AllianceHandler.getExecutor())
			.get("/:id/corporations/",
				AllianceHandler.getCorporations())
		)
		.use("/killmails", Router(m)
			.get("/",
				KillmailHandler.filter())
			.get("/:id/",
				KillmailHandler.getById())
		);