
	"use strict";

	class BaseHandler {

		static getMethods () {
			return (Object.getPrototypeOf(this).name === "" ?
				[] : Object.getOwnPropertyNames(Object.getPrototypeOf(this))
			).concat(Object.getOwnPropertyNames(this)).filter(name => !["length", "prototype", "name"].includes(name));
		}

	}

	module.exports = BaseHandler;
