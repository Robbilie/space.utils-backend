
	"use strict";

	function FunctionWrap (p) {
		return new Proxy(p, {
			get: (P, n) => (...args) => FunctionWrap(d => p(d)[n](...args))
		});
	}

	module.exports = FunctionWrap;
	module.exports._ = FunctionWrap(d => d);
