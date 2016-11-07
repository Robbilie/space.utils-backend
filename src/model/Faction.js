
	"use strict";

	const { Entity } 		= require("model/");

	class Faction extends Entity {

	}

	Faction.types = {
		id: 	Number,
		name: 	String
	};

	module.exports = Faction;
