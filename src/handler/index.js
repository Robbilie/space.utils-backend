
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
