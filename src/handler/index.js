
	"use strict";

	module.exports = new Proxy({}, { get: (P,key) => {
		if(typeof(key) == "symbol")
			throw new Error(key);
		return require(`./${key}`);
	}});
