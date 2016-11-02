
	"use strict";

	module.exports = new Proxy({}, { get: (P,key) => {
		console.log(key);
		if(typeof(key) == "symbol")
			throw new Error(key);
		return require(`./${key}`);
	}});
