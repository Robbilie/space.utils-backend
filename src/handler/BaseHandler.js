
	"use strict";

	class BaseHandler {

		static getMethods () {
			return (Object.getPrototypeOf(this).name == "" ?
				[] : Object.getOwnPropertyNames(Object.getPrototypeOf(this)).slice(3)
			).concat(Object.getOwnPropertyNames(this).slice(3));
		}

	}

	module.exports = BaseHandler;
