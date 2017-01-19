
	"use strict";

	class WelcomePage extends Page {

		constructor (parent) {
			super(parent, "Home");
			this.ready();
		}

		render () {
			return $(["div", { className: "welcome page" }, [
				["div", { className: "welcome-vp" }, [
					["img", { src: "./img/1x2.png" }],
					["img", { src: "./img/1x2.png", className: "mobo" }],
					["img", { src: "./img/1x2.png", className: "mobo" }],
					["div", { className: "welcome-conti" }, [
						["a", { id: "search", href: "/search/#search", style: "clip-path: url(#pone);" }, [
							["h2", { innerHTML: "SEARCH" }],
							["img", { src: "./img/1x2.png" }]
						]],
						["a", { id: "killboard", href: "/killboard/#killboard", style: "clip-path: url(#ptwo);" }, [
							["h2", { innerHTML: "KILLBOARD" }],
							["img", { src: "./img/1x2.png" }]
						]],
						["a", { id: "service", href: "https://service.eneticum.de/", target: "_blank", style: "clip-path: url(#pthree);" }, [
							["h2", { innerHTML: "SERVICE" }],
							["img", { src: "./img/1x2.png" }]
						]]
					]]
				]]
			]]);
		}

	}
	