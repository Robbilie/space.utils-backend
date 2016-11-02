
	"use strict";

	module.exports = new Proxy({}, { get: (P,key) => console.log(key) || require(`./${key}`) });
