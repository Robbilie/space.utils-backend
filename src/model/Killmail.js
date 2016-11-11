
	"use strict";

	const { ObjectId } 					= require("mongodb");
	const { Base } 						= require("model/");
	const { PatchUtil } 				= require("util/");

	class Killmail extends Base {

		getKillID () {}

	}

	Killmail.types = {
		_id: 				ObjectId,
		killID: 			Number,
		hash: 				String,
		solarSystem: 		"System",
		killTime: 			Number,
		attackers: 			"KillmailAttackerList",
		attackerCount: 		Number,
		victim: 			"KillmailVictim"
	};

	PatchUtil.model(Killmail);

	module.exports = Killmail;
