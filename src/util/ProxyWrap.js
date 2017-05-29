
	"use strict";

	module.exports = function ProxyWrap (p) {
		return new Proxy(p, {
			get: (promise, name) => name === "then" ?
				(...args) => promise.then(...args) :
				(...args) => ProxyWrap(promise.then(object => object[name](...args)))
		});
	};
