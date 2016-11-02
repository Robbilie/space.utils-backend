
	"use strict";

	module.exports = new Proxy({}, { get: (P,key) => {
		console.log(key);
		if(typeof(key) == "symbol")
			return {};
		try {
			return require(`./${key}`);
		} catch (e) {
			return undefined;
		}
	}});

	/*
	module.exports = {
		BaseHandler: require("./BaseHandler"),
		EntityHandler: require("./EntityHandler"),
		CharacterHandler: require("./CharacterHandler"),
		CorporationHandler: require("./CorporationHandler"),
		AllianceHandler: require("./AllianceHandler"),
		KillmailHandler: require("./KillmailHandler")
	};
	*/
