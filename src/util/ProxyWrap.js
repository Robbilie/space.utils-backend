
	"use strict";

	module.exports = p => new Proxy(p, {
		get: (promise, name) => name === "then" ?
			(...args) => promise.then(...args) :
			(...args) => proxyWrap(promise.then(object => object[name](...args)))
	});
