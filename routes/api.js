
	"use strict";

	const { Router } 	= require("express");
	const {
		CharacterHandler,
		CorporationHandler,
		AllianceHandler,
		KillmailHandler
	} = require("handler/");
	const config 		= require("util/../../config/");
	const m = { mergeParams: true };

	module.exports = Router(m)
		.get("/", (req, res) => res.json({
			characters: {
				href: `${config.site.url}/characters/`
			},
			corporations: {
				href: `${config.site.url}/corporations/`
			},
			alliances: {
				href: `${config.site.url}/alliances/`
			},
			killmails: {
				href: `${config.site.url}/killmails/`
			}
		}))
		.use("/characters", Router(m)
			.post("/",
				CharacterHandler.filter())
			.get("/:id/",
				CharacterHandler.getById())
			.get("/:id/corporation/",
				CharacterHandler.getCorporation())
		)
		.use("/corporations", Router(m)
			.post("/",
				CorporationHandler.filter())
			.get("/:id/",
				CorporationHandler.getById())
			.get("/:id/alliance/",
				CorporationHandler.getAlliance())
			.get("/:id/ceo/",
				CorporationHandler.getCeo())
		)
		.use("/alliances", Router(m)
			.post("/",
				AllianceHandler.filter())
			.get("/:id/",
				AllianceHandler.getById())
			.get("/:id/executor/",
				AllianceHandler.getExecutor())
			.get("/:id/corporations/",
				AllianceHandler.getCorporations())
		)
		.use("/killmails", Router(m)
			.post("/",
				KillmailHandler.filter())
			.get("/:id/",
				KillmailHandler.getById())
			.get("/:id/:hash/",
				KillmailHandler.getOrCreate())
		);
	