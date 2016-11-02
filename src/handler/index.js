
	"use strict";

	module.exports = new Proxy({}, { get: (P,key) => {
		console.log(key);
		if(typeof(key) == "symbol")
			return {};
		return require(`./${key}`);
	}});
