
	"use strict";

	module.exports = function FunctionWrap (p) {
		return new Proxy(p, {
			get: (P, n) => (...args) => FunctionWrap(d => p(d)[n](...args))
		});
	};

	module.exports._ = FunctionWrap(d => d);
