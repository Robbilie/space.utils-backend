
	"use strict";

	/*module.exports = new Proxy({}, { get: (P,key) => {
		console.log(key);
		if(typeof(key) == "symbol")
			return {};
		try {
			return require(`./${key}`);
		} catch (e) {
			return undefined;
		}
	}});*/

	module.exports = {
		BaseHandler: new Proxy({}, { get: () => require("./BaseHandler") }),
		EntityHandler: new Proxy({}, { get: () => require("./EntityHandler") }),
		CharacterHandler: new Proxy({}, { get: () => require("./CharacterHandler") }),
		CorporationHandler: new Proxy({}, { get: () => require("./CorporationHandler") }),
		AllianceHandler: new Proxy({}, { get: () => require("./AllianceHandler") }),
		KillmailHandler: new Proxy({}, { get: () => require("./KillmailHandler") })
	};
