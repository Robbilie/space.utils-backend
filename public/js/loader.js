
	"use strict";

	class Loader {

		static initialize (name, module, router) {
			console.log("Loader initializes…");
			window.on("load", () => {
				console.log("Loaded, initializing…");
				let el = $(name);
				let instance = new module(el, router);
				el.append(instance.render());
				window.app = instance;
			});
		}

	}